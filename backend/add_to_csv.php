<?php
// Allow requests from Angular frontend
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get POST data
$filename = $_POST['filename'] ?? '';
$email = $_POST['email'] ?? '';

// Path to uploads folder
$filepath = __DIR__ . '/uploads/' . $filename;

// Check if file exists
if (!file_exists($filepath)) {
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}

// Read header to find "email" column index
$header = [];
if (($handle = fopen($filepath, 'r')) !== false) {
    $header = fgetcsv($handle);
    fclose($handle);
}

if (!$header || !in_array('email', $header)) {
    echo json_encode(['success' => false, 'message' => 'No "email" column found']);
    exit;
}

$emailIndex = array_search('email', $header);

// Optional: Prevent duplicates in the email column
$existingEmails = [];
if (($handle = fopen($filepath, 'r')) !== false) {
    // Skip header
    fgetcsv($handle);
    while (($row = fgetcsv($handle)) !== false) {
        if (isset($row[$emailIndex])) {
            $existingEmails[] = $row[$emailIndex];
        }
    }
    fclose($handle);
}

if (in_array($email, $existingEmails)) {
    echo json_encode(['success' => false, 'message' => 'Email already exists']);
    exit;
}

// Append a new row with email in the right column
$newRow = array_fill(0, count($header), ''); // fill with empty strings
$newRow[$emailIndex] = $email;

$file = fopen($filepath, 'a');
fputcsv($file, $newRow);
fclose($file);

echo json_encode(['success' => true, 'message' => 'Email added successfully']);
?>
