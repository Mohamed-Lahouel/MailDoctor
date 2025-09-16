<?php
// Include the correct database connection
require 'db_connect.php'; // make sure db_connect.php uses 'maildoctor' as DB

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request (for CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Prepare the response array
$response = [
    'success' => false,
    'message' => '',
    'idUser' => ''
];

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data['email'] ?? '');

    if (!empty($email)) {
        // Prepare SQL statement to prevent SQL injection
        $stmt = $conn->prepare("SELECT idUser FROM users WHERE email = ?");
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();

        if ($stmt->num_rows > 0) {
            $stmt->bind_result($idUser);
            $stmt->fetch();
            $response['success'] = true;
            $response['message'] = 'User exists.';
            $response['idUser'] = $idUser;
        } else {
            $response['message'] = 'User does not exist.';
        }

        $stmt->close();
    } else {
        $response['message'] = 'Email is required.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

// Close the connection
$conn->close();

// Return JSON response
echo json_encode($response);
?>
