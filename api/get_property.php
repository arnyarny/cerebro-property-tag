<?php
include '../db/db.php';

header('Content-Type: application/json');

$propertyId = $_GET['id'] ?? null;

if (!$propertyId) {
    echo json_encode(["success" => false, "message" => "Property ID is required."]);
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

    if ($property) {
        echo json_encode(["success" => true, "property" => $property]);
    } else {
        echo json_encode(["success" => false, "message" => "Property not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
