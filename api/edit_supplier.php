<?php
include '../db/db.php';
header('Content-Type: application/json');

// Get the posted data
$data = json_decode(file_get_contents("php://input"), true);

$supplierId = $data['supplierId'] ?? null;
$supplierName = $data['supplierName'] ?? null;

if (!$supplierId || !$supplierName) {
    echo json_encode(["success" => false, "message" => "Supplier ID and Name are required."]);
    exit;
}

try {
    // Update the supplier name
    $stmt = $conn->prepare("UPDATE suppliers SET name = ? WHERE supplier_id = ?");
    $stmt->bind_param("si", $supplierName, $supplierId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Supplier updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "No changes made or supplier not found."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
