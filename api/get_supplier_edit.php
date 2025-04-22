<?php
include '../db/db.php';
header('Content-Type: application/json');

$supplier_id = $_GET['id'] ?? null; // Get the supplier_id from the URL query parameter

if (empty($supplier_id)) {
    echo json_encode(["success" => false, "message" => "Supplier ID is required."]);
    exit;
}

try {
    // Query to fetch a single supplier by supplier_id
    $stmt = $conn->prepare("SELECT supplier_id, name FROM suppliers WHERE supplier_id = ?");
    $stmt->bind_param("i", $supplier_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if the supplier exists
    if ($result->num_rows > 0) {
        $supplier = $result->fetch_assoc();
        echo json_encode(["success" => true, "supplier" => $supplier]);
    } else {
        echo json_encode(["success" => false, "message" => "Supplier not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
