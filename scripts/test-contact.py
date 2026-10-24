#!/usr/bin/env python3
"""Local PHP integration tests. ALWAYS replace sendmail; no external mail is sent.

Usage: PHP_BIN=php python3 scripts/test-contact.py
"""
import base64
import http.cookiejar
import json
import os
from pathlib import Path
import re
import secrets
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
PHP = os.environ.get("PHP_BIN", "php")


with tempfile.TemporaryDirectory(prefix="portfolio-contact-") as temporary:
    private = Path(temporary)
    sessions = private / "sessions"
    sessions.mkdir()
    capture = private / "mail.json"
    mode = private / "mode"
    mode.write_text("success")
    transport = private / "sendmail"
    transport.write_text(
        "#!/usr/bin/env python3\n"
        "import json, pathlib, sys\n"
        f"p = pathlib.Path({str(private)!r})\n"
        "raw = sys.stdin.read()\n"
        "(p / 'mail.json').write_text(json.dumps({'args': sys.argv[1:], 'raw': raw}))\n"
        "sys.exit(1 if (p / 'mode').read_text() == 'failure' else 0)\n"
    )
    transport.chmod(0o700)
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    origin = f"http://127.0.0.1:{port}"
    endpoint = origin + "/api/contact.php"
    config = private / "contact-config.php"
    config.write_text("<?php return " + "[\n"
                      "'to' => 'recipient@example.test',\n"
                      "'from' => 'sender@example.test',\n"
                      f"'origin' => '{origin}',\n"
                      f"'rate_secret' => '{secrets.token_hex(32)}',\n"
                      f"'rate_dir' => '{private}/rate-limit',\n];\n")
    environment = {**os.environ, "PORTFOLIO_CONTACT_CONFIG": str(config)}
    command = [PHP, "-n", "-d", f"sendmail_path={transport}",
               "-d", f"session.save_path={sessions}", "-S", f"127.0.0.1:{port}", "-t", str(ROOT)]
    # Server access logs are discarded; test payloads contain no real personal data.
    server = subprocess.Popen(command, env=environment, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def request(data=None, *, headers=None, raw=None, method=None):
        body = json.dumps(data).encode() if data is not None else raw
        request_headers = {"Origin": origin}
        if body is not None:
            request_headers["Content-Type"] = "application/json"
        request_headers.update(headers or {})
        req = urllib.request.Request(endpoint, data=body, headers=request_headers, method=method)
        try:
            response = client.open(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        return response.status, json.loads(response.read())

    try:
        for _ in range(100):
            try:
                status, settings = request()
                break
            except urllib.error.URLError:
                time.sleep(0.05)
        else:
            raise AssertionError("PHP server failed to start")
        assert status == 200 and settings["enabled"] is True
        token = settings["token"]
        valid = {"name": "テスト利用者", "email": "visitor@example.test", "subject": "",
                 "message": "テスト本文\n改行と日本語", "website": "", "token": token}
        assert request(valid)[1]["code"] == "bot"  # minimum fill time
        time.sleep(3.1)
        assert request(valid, headers={"Origin": "https://other.example.test"})[0] == 403
        assert request(valid, headers={"Origin": ""})[0] == 403
        assert request({**valid, "token": "wrong"})[1]["code"] == "csrf"
        assert request(valid, headers={"Sec-Fetch-Site": "cross-site"})[0] == 403
        assert request({**valid, "website": "bot"})[1]["code"] == "bot"
        assert request(raw=b"{}", headers={"Content-Type": "text/plain"})[0] == 415
        assert request(raw=b"{")[0] == 400
        assert request(raw=b"x" * 16385)[0] == 413
        assert request(method="PUT")[0] == 405
        for key in ("name", "email", "message"):
            assert key in request({**valid, key: ""})[1]["errors"]
            assert key in request({**valid, key: "\u3000"})[1]["errors"]
        for key, limit in (("name", 100), ("email", 254), ("message", 2000)):
            assert key in request({**valid, key: "x" * (limit + 1)})[1]["errors"]
        for key, value in (("email", "wrong"), ("email", "a@example.test\r\nBcc:x@example.test"),
                           ("name", ["array"]), ("name", "x\r\nBcc:x"),
                           ("message", "x\x00"), ("subject", "unlisted"), ("message", "😀" * 1001)):
            assert key in request({**valid, key: value})[1]["errors"]
        assert not capture.exists(), "Rejected requests must not call the mail transport"
        status, result = request({**valid, "message": "あ" * 2000, "name": "名" * 100})
        assert status == 200 and result == {"ok": True, "code": "sent"}
        mail = json.loads(capture.read_text())
        assert "From: Portfolio <sender@example.test>" in mail["raw"]
        assert "Reply-To: visitor@example.test" in mail["raw"]
        assert "-fsender@example.test" in mail["args"]
        assert "=?UTF-8?B?" in mail["raw"]
        encoded = mail["raw"].replace("\r\n", "\n").split("\n\n", 1)[1]
        assert "あ" * 2000 in base64.b64decode(encoded).decode()
        assert request(valid)[1]["code"] == "csrf", "Successful token must be consumed"
        token = request()[1]["token"]
        valid["token"] = token
        time.sleep(3.1)
        assert request(valid)[1]["code"] == "rate"
        records = (private / "rate-limit/contact-rate.json").read_text()
        assert "127.0.0.1" not in records and "visitor" not in records
        (private / "rate-limit/contact-rate.json").unlink()
        mode.write_text("failure")
        status, result = request(valid)
        assert status == 502 and result["ok"] is False and result["code"] == "send"
        # Force only the local fixture's token age; no production clock/test switch.
        for session_file in sessions.iterdir():
            content = session_file.read_text()
            session_file.write_text(re.sub(r"issued\|i:\d+;", "issued|i:0;", content))
        assert request(valid)[1]["code"] == "csrf"
        config.rename(private / "disabled.php")
        assert request()[1]["enabled"] is False
        assert request(valid)[0] == 503
        config.write_text("<?php return ['to' => '', 'from' => ''];")
        assert request()[1]["enabled"] is False
        print("PASS HTTP: validation/boundaries/UTF-16, CSRF/origin, bot checks, body/method limits,")
        print("  mail MIME/fixed From/Reply-To, token replay, rate limit, failure, missing/invalid config.")
        print("  Fake sendmail captured all transport calls. No external mail sent.")

        # Test time windows without sleeps; real production rate function and private storage.
        checks = private / "rate-tests.php"
        checks.write_text("<?php\nrequire " + repr(str(ROOT / "api/contact-lib.php")) + ";\n"
                          f"$c = ['rate_dir' => '{private}/rate-limit', 'rate_secret' => str_repeat('x', 32)];\n"
                          "@unlink($c['rate_dir'].'/contact-rate.json');\n"
                          "$n=100000;\n"
                          "if (!contact_rate_limit($c,'same-ip',$n)) exit(1);\n"
                          "if (contact_rate_limit($c,'same-ip',$n+59)) exit(2);\n"
                          "for($i=1;$i<5;$i++) if(!contact_rate_limit($c,'same-ip',$n+$i*60)) exit(3);\n"
                          "if(contact_rate_limit($c,'same-ip',$n+300)) exit(4);\n"
                          "if(!contact_rate_limit($c,'same-ip',$n+901)) exit(5);\n"
                          f"if(contact_private_path('{ROOT / 'api'}','{ROOT}')) exit(6);\n"
                          'echo "PASS private storage, 60-second cooldown, 5/15-minute limit and expiry.\\n";\n')
        subprocess.run([PHP, "-n", str(checks)], env=environment, check=True)
    finally:
        server.terminate()
        server.wait(timeout=5)
