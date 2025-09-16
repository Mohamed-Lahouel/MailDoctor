<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Handle preflight
}

$uploadDir = __DIR__ . '/uploads/';

if (is_dir($uploadDir)) {
    $files = glob($uploadDir . '*'); // get all file names
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file); // delete file
        }
    }
}

echo json_encode(['success' => true]);
?>
