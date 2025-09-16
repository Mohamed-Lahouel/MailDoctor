<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// Return JSON
header('Content-Type: application/json');

// Database connection
require 'db_connect.php'; // defines $conn

// Get POSTed JSON
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['username']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$username = $conn->real_escape_string($data['username']);
$email    = $conn->real_escape_string($data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

// Check if email already exists
$checkEmailQuery = "SELECT idUser FROM users WHERE email = '$email'";
$emailResult = $conn->query($checkEmailQuery);

if ($emailResult && $emailResult->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email already used']);
    exit();
}

// Insert new user (created_at and modified_at are automatic)
$insertQuery = "INSERT INTO users (username, email, password) 
                VALUES ('$username', '$email', '$password')";

if ($conn->query($insertQuery) === TRUE) {
    echo json_encode(['success' => true, 'message' => 'User registered successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $conn->error]);
}

$conn->close();
?>
