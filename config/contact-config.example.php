<?php
// Copy OUTSIDE public_html as portfolio-private/contact-config.php.
// Empty addresses deliberately keep sending disabled. Never commit real settings.
return [
    'to' => '',
    'from' => '', // Fixed mailbox created for the site's domain on Xserver.
    'origin' => '', // e.g. https://your-domain.example (no path or trailing slash).
    'rate_secret' => '', // Generate with: php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
    'rate_dir' => __DIR__ . '/rate-limit', // Private, writable by PHP only.
];
