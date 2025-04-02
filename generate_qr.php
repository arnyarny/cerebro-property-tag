<?php
include 'db/db.php';

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');

$propertyId = $_GET['propertyId'] ?? null;

if (!$propertyId) {
    http_response_code(400);
    echo 'Property ID is required.';
    exit;
}

try {
    // Fetch property details from the database
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

    // Prepare data for the QR code
    $data = "ID: {$property['id']}\nItem Name: {$property['item_name']}\nDate: {$property['date']}\nSupplier: {$property['item_supplier']}\nAmount: {$property['amount']}";

    // Generate QR code URL using Google Charts API
    $googleChartsUrl = 'https://chart.googleapis.com/chart?' . http_build_query([
        'cht' => 'qr',
        'chs' => '300x300',
        'chl' => $data,
        'choe' => 'UTF-8'
    ]);

    // Redirect to the Google Charts URL
    header('Location: ' . $googleChartsUrl);
    exit;

} catch (Exception $e) {
    error_log("Error generating QR code for property ID {$propertyId}: " . $e->getMessage());
    http_response_code(500);
    echo 'Error generating QR code: ' . $e->getMessage();
}
?>
