<?php

require_once __DIR__ . '/../vendor/autoload.php';
include '../db/db.php'; // Include your existing database connection

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

if (!isset($_GET['id'])) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Property ID not provided.']);
    exit;
}

$propertyId = $_GET['id'];

// Fetch property details from the database
$stmt = $conn->prepare("
    SELECT p.id, i.name AS item_name, p.date, s.name AS item_supplier, p.amount 
    FROM properties p 
    JOIN items i ON p.item_id = i.item_id  
    JOIN suppliers s ON p.supplier_id = s.supplier_id  
    WHERE p.id = ?
");
$stmt->bind_param("i", $propertyId); // "i" indicates the parameter type is an integer
$stmt->execute();
$result = $stmt->get_result();
$property = $result->fetch_assoc();

if (!$property) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Property not found.']);
    exit;
}

// Prepare data for the QR code in JSON format
$data = json_encode([
    'id' => $propertyId,
    'item_name' => $property['item_name'],
    'date' => $property['date'],
    'item_supplier' => $property['item_supplier'],
    'amount' => $property['amount']
]);

$options = new QROptions([
    'eccLevel' => QRCode::ECC_L,
    'outputType' => QRCode::OUTPUT_IMAGE_PNG,
    'imageBase64' => false, // Do not return base64, we will output directly to a file
]);

$qrcode = new QRCode($options);
$qrcodeData = $qrcode->render($data);

// Load the existing image
$templateImagePath = __DIR__ . '/../templates/cerebro_property_id.png';
$templateImage = imagecreatefrompng($templateImagePath);

if ($templateImage === false) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to load template image.']);
    exit;
}

// Create an image resource from the QR code data
$qrcodeImage = imagecreatefromstring($qrcodeData);

if ($qrcodeImage === false) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Failed to create QR code image.']);
    exit;
}

// Define the position for overlaying the QR code (adjust as needed)
$qrX = 108; // X position
$qrY = 181; // Y position

// Overlay the QR code onto the template image
imagecopy($templateImage, $qrcodeImage, $qrX, $qrY, 0, 0, imagesx($qrcodeImage), imagesy($qrcodeImage));

// Save the combined image to a file
$outputImagePath = __DIR__ . '/../qr_codes/property_' . $propertyId . '.png'; // Path to save the output image
imagepng($templateImage, $outputImagePath);

// Free memory
imagedestroy($templateImage);
imagedestroy($qrcodeImage);

// Return the path of the combined image in JSON
header('Content-Type: application/json');
echo json_encode(['image_url' => 'qr_codes/property_' . $propertyId . '.png']); 

// Close the database connection
$conn->close();
?>
