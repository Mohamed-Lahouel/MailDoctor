<?php
// Allow requests from Angular dev server
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Folder where CSVs are stored
$folder = __DIR__ . '/uploads';

// Get all CSV files
$files = array_values(array_filter(scandir($folder), function($file) use ($folder) {
    return is_file($folder . '/' . $file) && strtolower(pathinfo($file, PATHINFO_EXTENSION)) === 'csv';
}));

echo json_encode($files);
