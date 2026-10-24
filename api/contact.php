<?php
declare(strict_types=1);

// Never expose PHP errors or log request bodies/addresses.
ini_set('display_errors', '0');
set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
    throw new ErrorException('Contact processing error', 0, $severity, $file, $line);
});
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function contact_response(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

try {
    require __DIR__ . '/contact-lib.php';
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if (!in_array($method, ['GET', 'POST'], true)) {
        header('Allow: GET, POST');
        contact_response(405, ['ok' => false, 'code' => 'method']);
    }
    $path = getenv('PORTFOLIO_CONTACT_CONFIG') ?: dirname(__DIR__, 2) . '/portfolio-private/contact-config.php';
    $config = contact_config($path, $_SERVER['DOCUMENT_ROOT'] ?? '');
    if ($config === null) {
        contact_response($method === 'GET' ? 200 : 503, ['ok' => false, 'enabled' => false, 'code' => 'unavailable']);
    }
    // Explicit configured origin; never infer trust from user-supplied Host/proxy headers.
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $fetchSite = $_SERVER['HTTP_SEC_FETCH_SITE'] ?? '';
    if (($origin !== '' && $origin !== $config['origin'])
        || ($method === 'POST' && $origin !== $config['origin'])
        || ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'none'], true))) {
        contact_response(403, ['ok' => false, 'code' => 'forbidden']);
    }
    session_name('portfolio_contact');
    session_start([
        'use_strict_mode' => 1,
        'use_only_cookies' => 1,
        'cookie_httponly' => true,
        'cookie_secure' => str_starts_with($config['origin'], 'https://'),
        'cookie_samesite' => 'Strict',
        'cookie_path' => rtrim(dirname($_SERVER['SCRIPT_NAME']), '/') . '/',
    ]);
    $now = time();
    if ($method === 'GET') {
        if (!isset($_SESSION['token'], $_SESSION['issued']) || $now - $_SESSION['issued'] > 3600) {
            $_SESSION['token'] = bin2hex(random_bytes(32));
            $_SESSION['issued'] = $now;
        }
        contact_response(200, ['ok' => true, 'enabled' => true, 'token' => $_SESSION['token']]);
    }
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        contact_response(415, ['ok' => false, 'code' => 'content_type']);
    }
    $raw = file_get_contents('php://input', false, null, 0, 16385);
    if ($raw === false || strlen($raw) > 16384) {
        contact_response(413, ['ok' => false, 'code' => 'size']);
    }
    try {
        $data = json_decode($raw, true, 16, JSON_THROW_ON_ERROR);
    } catch (JsonException $error) {
        contact_response(400, ['ok' => false, 'code' => 'input']);
    }
    if (!is_array($data)) {
        contact_response(400, ['ok' => false, 'code' => 'input']);
    }
    if (!is_string($data['token'] ?? null) || !isset($_SESSION['token'], $_SESSION['issued'])
        || !hash_equals($_SESSION['token'], $data['token']) || $now - $_SESSION['issued'] > 3600) {
        contact_response(403, ['ok' => false, 'code' => 'csrf']);
    }
    // Minimum fill time + honeypot. These supplement, rather than replace, rate limiting.
    if (($data['website'] ?? '') !== '' || $now - $_SESSION['issued'] < 3) {
        contact_response(422, ['ok' => false, 'code' => 'bot']);
    }
    $errors = contact_validate($data);
    if ($errors) {
        contact_response(422, ['ok' => false, 'code' => 'validation', 'errors' => $errors]);
    }
    if (!contact_rate_limit($config, $_SERVER['REMOTE_ADDR'] ?? '', $now)) {
        header('Retry-After: 60');
        contact_response(429, ['ok' => false, 'code' => 'rate']);
    }
    if (!contact_send($config, $data)) {
        contact_response(502, ['ok' => false, 'code' => 'send']);
    }
    unset($_SESSION['token'], $_SESSION['issued']);
    contact_response(200, ['ok' => true, 'code' => 'sent']);
} catch (Throwable $error) {
    // Intentionally no exception text, request contents, addresses, or raw IP logging.
    contact_response(503, ['ok' => false, 'code' => 'unavailable']);
}
