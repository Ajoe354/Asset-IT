<?php
/**
 * Contoh Script Koneksi Database MySQL cPanel (PDO)
 * File ini membaca konfigurasi dari .env atau langsung dari konstanta.
 */

// Load variabel dari file .env jika ada
if (file_exists(__DIR__ . '/../.env')) {
    $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2) + [NULL, NULL];
        if ($name && $value) {
            putenv(trim($name) . '=' . trim($value));
        }
    }
}

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$db   = getenv('DB_NAME') ?: 'usernamecpanel_itassets';
$user = getenv('DB_USER') ?: 'usernamecpanel_dbadmin';
$pass = getenv('DB_PASSWORD') ?: '';

$charset = 'utf8mb4';
$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    // Koneksi berhasil!
} catch (\PDOException $e) {
    // Jika koneksi gagal, kembalikan respons JSON error
    header('Content-Type: application/json', true, 500);
    echo json_encode([
        'success' => false,
        'message' => 'Gagal terkoneksi ke database: ' . $e->getMessage()
    ]);
    exit;
}
