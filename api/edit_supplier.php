<?php
include '../db/db.php';
header('Content-Type: application/json');

// Retrieve the supplier_id and supplier_name from the decoded data
$supplierId = $_POST['supplierId'] ?? null;
$supplierName = $_POST['name'] ?? null;

if (!$supplierId || !$supplierName) {
    echo json_encode(["success" => false, "message" => "Supplier ID and Name are required."]);
    exit;
}

try {
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