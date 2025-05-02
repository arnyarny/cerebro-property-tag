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
    SELECT p.id, i.name AS item_name, p.purchased_date, s.name AS item_supplier, p.amount 
    FROM properties p 
    JOIN items i ON p.item_id = i.item_id  
    JOIN suppliers s ON p.supplier_id = s.supplier_id  
    WHERE p.id = ?
");
$stmt->bind_param("i", $propertyId);
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
    'purchased_date' => $property['purchased_date'],
    'item_supplier' => $property['item_supplier'],
    'amount' => $property['amount']
]);

$options = new QROptions([
    'eccLevel' => QRCode::ECC_L,
    'outputType' => QRCode::OUTPUT_IMAGE_PNG,
    'imageBase64' => false, // Do not return base64, we will output directly to the browser
]);

$qrcode = new QRCode($options);
$qrcodeData = $qrcode->render($data);

// Load the existing image
$templateImagePath = __DIR__ . '/../template/cerebro_property_id.png';
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

$qrcodeWidth = imagesx($qrcodeImage);
$qrcodeHeight = imagesy($qrcodeImage);

// Center it dynamically instead of using fixed coordinates
$qrX = (imagesx($templateImage) - $qrcodeWidth) / 2; // Center horizontally
$qrY = (imagesy($templateImage) - $qrcodeHeight) / 1.5; // Center vertically

// Overlay the QR code onto the template image
imagecopy($templateImage, $qrcodeImage, $qrX, $qrY, 0, 0, imagesx($qrcodeImage), imagesy($qrcodeImage));

// Add text (Property ID) at the bottom of the QR code
$fontPath = __DIR__ . '/../fonts/Vera.ttf'; // Ensure this font file exists
$fontSize = 20;
$textColor = imagecolorallocate($templateImage, 0, 0, 0); // Black text
$text = date("m/d/Y", strtotime($property['purchased_date']));


// Get text bounding box
$bbox = imagettfbbox($fontSize, 0, $fontPath, $text);
$textWidth = $bbox[2] - $bbox[0];
$textHeight = $bbox[1] - $bbox[7];

$textX = (imagesx($templateImage) - $textWidth) / 2; // Center horizontally
$textY = $qrY + $qrcodeHeight + $textHeight + 55; // Position below QR code

imagettftext($templateImage, $fontSize, 0, $textX, $textY, $textColor, $fontPath, $text);

// // Draw a rectangle outline around the final image
// $outlineColor = imagecolorallocate($templateImage, 0, 0, 0); // Color for the outline (black)
// $strokeWidth = 1; // Stroke width in pixels

// // Draw the rectangle
// imagerectangle($templateImage, 
//     $strokeWidth / 2, // X1
//     $strokeWidth / 2, // Y1
//     imagesx($templateImage) - ($strokeWidth / 2), // X2
//     imagesy($templateImage) - ($strokeWidth / 2), // Y2
//     $outlineColor // Outline color
// );

// Set the content type header to output the image directly
header('Content-Type: image/png');

// Output the combined image directly to the browser
imagepng($templateImage);

// Free memory
imagedestroy($templateImage);
imagedestroy($qrcodeImage);

// Close the database connection
$conn->close();
?>
