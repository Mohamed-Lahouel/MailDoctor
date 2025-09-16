<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0); // Handle preflight
}

$response = ['success' => false, 'files' => []];

// Directory where files will be saved
$uploadDir = __DIR__ . '/uploads/';

// Create uploads folder if it doesn't exist
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['files'])) {
    $files = $_FILES['files'];
    
    for ($i = 0; $i < count($files['name']); $i++) {
        $tmpName = $files['tmp_name'][$i];
        $name = basename($files['name'][$i]);

        // Only allow CSV files
        $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
        if ($ext !== 'csv') {
            continue;
        }

        $targetFile = $uploadDir . $name;

        if (move_uploaded_file($tmpName, $targetFile)) {
            $response['files'][] = $name;
        }
    }

    if (count($response['files']) > 0) {
        $response['success'] = true;
    }
}

echo json_encode($response);
?>
