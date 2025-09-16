<?php
// --- CORS headers ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Return JSON
header('Content-Type: application/json');

// Database connection
require 'db_connect.php'; // defines $conn

// Get POSTed JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!$data || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

// Check if user exists
$query = "SELECT * FROM users WHERE email = '$email'";
$result = $conn->query($query);

if ($result && $result->num_rows === 1) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user['idUser'],
                'username' => $user['username'],
                'email' => $user['email']
            ],
            'redirect' => 'layout' // your Angular route
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}

$conn->close();
?>
