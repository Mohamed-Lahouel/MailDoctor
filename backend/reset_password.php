<?php
require 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['idUser'], $data['newPassword'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid data.']);
    exit;
}

$idUser = intval($data['idUser']);
$newPassword = password_hash($data['newPassword'], PASSWORD_BCRYPT);

$stmt = $conn->prepare("UPDATE users SET password=? WHERE idUser=?");
$stmt->bind_param("si", $newPassword, $idUser);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to update password.']);
}

$stmt->close();
$conn->close();
