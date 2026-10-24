<?php
declare(strict_types=1);

// Shared implementation; this file does not send mail by itself.
function contact_private_path(string $path, string $documentRoot): bool
{
    $root = realpath($documentRoot);
    $real = realpath($path);
    return $root !== false && $real !== false
        && $real !== $root && !str_starts_with($real, $root . DIRECTORY_SEPARATOR);
}

function contact_email(string $value): bool
{
    // ASCII mailbox only; exclude controls/options before using headers or -f.
    return strlen($value) <= 254
        && preg_match('/\A[A-Za-z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+\z/', $value) === 1
        && filter_var($value, FILTER_VALIDATE_EMAIL) !== false;
}

function contact_config(string $path, string $documentRoot): ?array
{
    if (!is_file($path) || !contact_private_path($path, $documentRoot)) {
        return null;
    }
    $config = require $path;
    if (!is_array($config)) {
        return null;
    }
    foreach (['to', 'from', 'origin', 'rate_secret', 'rate_dir'] as $key) {
        if (!isset($config[$key]) || !is_string($config[$key]) || $config[$key] === '') {
            return null;
        }
    }
    $url = parse_url($config['origin']);
    $scheme = $url['scheme'] ?? '';
    $host = $url['host'] ?? '';
    if (!contact_email($config['to']) || !contact_email($config['from'])
        || preg_match('/\A[A-Za-z0-9][A-Za-z0-9._+@-]*\z/', $config['from']) !== 1
        || strlen($config['rate_secret']) < 32 || !$host
        || ($scheme !== 'https' && !($scheme === 'http' && in_array($host, ['localhost', '127.0.0.1'], true)))
        || isset($url['user']) || isset($url['pass']) || isset($url['path'])
        || isset($url['query']) || isset($url['fragment'])) {
        return null;
    }
    // Validate the private parent BEFORE creating storage; never create it in public_html.
    $parent = dirname($config['rate_dir']);
    if (!contact_private_path($parent, $documentRoot)) {
        return null;
    }
    if (!is_dir($config['rate_dir']) && !mkdir($config['rate_dir'], 0700)) {
        return null;
    }
    return contact_private_path($config['rate_dir'], $documentRoot) && is_writable($config['rate_dir'])
        ? $config : null;
}

function contact_length(string $value): int
{
    // Match HTML/JS maxlength (UTF-16 code units, including surrogate pairs).
    preg_match_all('/./us', $value, $characters);
    $length = 0;
    foreach ($characters[0] as $character) {
        $length += strlen($character) === 4 ? 2 : 1;
    }
    return $length;
}

function contact_trim(string $value): string
{
    return preg_replace('/\A[\s\x{FEFF}]+|[\s\x{FEFF}]+\z/u', '', $value);
}

function contact_validate(array $data): array
{
    $errors = [];
    foreach (['name' => 100, 'email' => 254, 'subject' => 100, 'message' => 2000] as $key => $limit) {
        $value = $data[$key] ?? '';
        if (!is_string($value) || preg_match('//u', $value) !== 1) {
            $errors[$key] = '入力内容を確認してください。';
            continue;
        }
        if ($key !== 'subject' && contact_trim($value) === '') {
            $errors[$key] = ['name' => 'お名前を入力してください。', 'email' => 'メールアドレスを入力してください。', 'message' => 'お問い合わせ内容を入力してください。'][$key];
        } elseif (contact_length($value) > $limit) {
            $errors[$key] = $limit . '文字以内で入力してください。';
        } elseif ($key === 'email' && !contact_email(trim($value))) {
            $errors[$key] = '正しいメールアドレスを入力してください。';
        } elseif (($key !== 'message' && preg_match('/[\x00-\x1F\x7F]/', $value))
            || ($key === 'message' && preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value))) {
            $errors[$key] = '入力内容を確認してください。';
        } elseif ($key === 'subject' && !in_array($value, ['', '制作のご依頼', 'Webサイトのご相談', 'その他'], true)) {
            $errors[$key] = 'お問い合わせの種類を選び直してください。';
        }
    }
    return $errors;
}

function contact_rate_limit(array $config, string $ip, int $now): bool
{
    // Only a keyed hash and timestamps are stored; no raw IP or form values.
    $file = $config['rate_dir'] . '/contact-rate.json';
    $handle = fopen($file, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Rate storage unavailable');
    }
    try {
        if (!chmod($file, 0600) || !flock($handle, LOCK_EX)) {
            throw new RuntimeException('Rate lock unavailable');
        }
        $raw = stream_get_contents($handle, 2000001);
        if ($raw === false || strlen($raw) > 2000000) {
            throw new RuntimeException('Rate storage invalid');
        }
        $records = $raw === '' ? [] : json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($records)) {
            throw new RuntimeException('Rate storage invalid');
        }
        foreach ($records as $key => $times) {
            $records[$key] = array_values(array_filter($times, static fn ($time) => $time > $now - 900));
            if (!$records[$key]) {
                unset($records[$key]);
            }
        }
        $key = hash_hmac('sha256', $ip, $config['rate_secret']);
        $times = $records[$key] ?? [];
        $allowed = count($times) < 5 && (!$times || $now - max($times) >= 60);
        if ($allowed) {
            if (count($records) >= 10000 && !isset($records[$key])) {
                throw new RuntimeException('Rate capacity exceeded');
            }
            $records[$key][] = $now;
        }
        $json = json_encode($records, JSON_THROW_ON_ERROR);
        rewind($handle);
        if (!ftruncate($handle, 0) || fwrite($handle, $json) !== strlen($json) || !fflush($handle)) {
            throw new RuntimeException('Rate write failed');
        }
        return $allowed;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function contact_send(array $config, array $data): bool
{
    $subject = '=?UTF-8?B?' . base64_encode('Portfolio：お問い合わせ') . '?=';
    $body = 'お名前：' . trim($data['name']) . "\n"
        . 'メールアドレス：' . trim($data['email']) . "\n"
        . 'お問い合わせの種類：' . (($data['subject'] ?? '') ?: '未選択') . "\n\n"
        . "お問い合わせ内容：\n" . trim($data['message']) . "\n";
    $headers = [
        'From' => 'Portfolio <' . $config['from'] . '>',
        'Reply-To' => trim($data['email']),
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8',
        'Content-Transfer-Encoding' => 'base64',
    ];
    return mail($config['to'], $subject, chunk_split(base64_encode($body), 76, "\r\n"), $headers, '-f' . $config['from']);
}
