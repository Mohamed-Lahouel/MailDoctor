<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Disable warnings before sending JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', 0);

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
require __DIR__ . '/db_connect.php'; // defines $conn

// Include PHPMailer files
require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

// Get POSTed JSON
$data = json_decode(file_get_contents("php://input"), true);

// --- DEBUG: Show received data ---
error_log("Received data: " . print_r($data, true));

if (!$data || !isset($data['email']) || !isset($data['idUser']) || !isset($data['verificationCode'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid input', 'receivedData' => $data]);
    exit();
}

$email = $conn->real_escape_string($data['email']);
$idUser = intval($data['idUser']);
$verificationCode = $conn->real_escape_string($data['verificationCode']);

// Check if user exists
$checkUserQuery = "SELECT idUser FROM users WHERE idUser = '$idUser' AND email = '$email'";
$userResult = $conn->query($checkUserQuery);

if (!$userResult || $userResult->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User not found', 'receivedData' => $data]);
    exit();
}

// Send email
$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'mohamed.lahouel@esprit.tn'; // your Gmail
    $mail->Password = 'jnixyhivxhmeouvj'; // your new App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;

    $mail->setFrom('mohamed.lahouel@esprit.tn', 'MailDoctor'); // updated sender name
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = 'Password Reset Verification Code';
    $mail->Body = "<p>Your verification code is: <b>$verificationCode</b></p>";
    $mail->AltBody = "Your verification code is: $verificationCode";

    $mail->send();

    $response = [
        'success' => true,
        'message' => 'Email has been sent with the verification code.',
        'receivedData' => $data,
        'verificationCode' => $verificationCode // optional, for testing
    ];

} catch (Exception $e) {
    $response = [
        'success' => false,
        'message' => "Mailer Error: {$mail->ErrorInfo}",
        'receivedData' => $data
    ];
}

$conn->close();
echo json_encode($response);
?>
