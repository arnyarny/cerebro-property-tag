<?php
include 'db/db.php';

header('Content-Type: image/png');

$propertyId = $_GET['propertyId'] ?? null;

if (!$propertyId) {
    http_response_code(400);
    echo 'Property ID is required.';
    exit;
}

try {
    $stmt = $conn->prepare("SELECT p.id, i.name AS item_name, p.date, s.name AS item_supplier, p.amount
                            FROM properties p
                            JOIN items i ON p.item_id = i.item_id
                            JOIN suppliers s ON p.supplier_id = s.supplier_id
                            WHERE p.id = ?");
    $stmt->bind_param("s", $propertyId);
    $stmt->execute();
    $result = $stmt->get_result();
    $property = $result->fetch_assoc();

    if (!$property) {
        http_response_code(404);
        echo 'Property not found.';
        exit;
    }

    $data = "ID: {$property['id']}\nItem Name: {$property['item_name']}\nDate: {$property['date']}\nSupplier: {$property['item_supplier']}\nAmount: {$property['amount']}";

    // Generate QR code using Google Chart API
    $qrCodeUrl = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=" . urlencode($data) . "&choe=UTF-8";

    // Redirect to the QR code URL
    header("Location: $qrCodeUrl");
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo 'Error generating QR code: ' . $e->getMessage();
}
?>
