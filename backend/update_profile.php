<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // adjust for your frontend domain
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

include 'db_connect.php'; // your DB connection file

// Read POST data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['username']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$username = $conn->real_escape_string($data['username']);
$password = password_hash($data['password'], PASSWORD_DEFAULT); // hash the new password

// Update password in database
$sql = "UPDATE users SET password='$password' WHERE username='$username'";

if ($conn->query($sql)) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}

$conn->close();
?>
