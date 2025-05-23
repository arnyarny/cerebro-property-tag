<?php
include '../db/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

function getOrInsertItem($conn, $item_name) {
    $stmt = $conn->prepare("SELECT item_id FROM items WHERE name = ?");
    $stmt->bind_param("s", $item_name);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    if (!$item) {
        $stmt = $conn->prepare("INSERT INTO items (name) VALUES (?)");
        $stmt->bind_param("s", $item_name);
        $stmt->execute();
        return $stmt->insert_id;
    }
    return $item['item_id'];
}

function getOrInsertSupplier($conn, $supplier_name) {
    $stmt = $conn->prepare("SELECT supplier_id FROM suppliers WHERE name = ?");
    $stmt->bind_param("s", $supplier_name);
    $stmt->execute();
    $supplier = $stmt->get_result()->fetch_assoc();
    if (!$supplier) {
        $stmt = $conn->prepare("INSERT INTO suppliers (name) VALUES (?)");
        $stmt->bind_param("s", $supplier_name);
        $stmt->execute();
        return $stmt->insert_id;
    }
    return $supplier['supplier_id'];
}

function generatePropertyId($conn) {
    $currentYear = date("Y");
    $stmt = $conn->query("SELECT MAX(id) AS last_id FROM properties WHERE id LIKE '{$currentYear}%'");
    $row = $stmt->fetch_assoc();
    $nextId = $row['last_id'] ? intval(substr($row['last_id'], 4)) + 1 : 1;
    return $currentYear . str_pad($nextId, 4, "0", STR_PAD_LEFT);
}

$item_name = $_POST['item_name'] ?? null;
$purchased_date = $_POST['purchased_date'] ?? null;
$depreciation_date = $_POST['depreciation_date'] ?? null;
$supplier_name = $_POST['item_supplier'] ?? null;
$amount = $_POST['amount'] ?? null; 

if (!$item_name || !$purchased_date || !$depreciation_date || !$supplier_name || !isset($_POST['amount'])) {

    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

try {
    $item_id = getOrInsertItem($conn, $item_name);
    $supplier_id = getOrInsertSupplier($conn, $supplier_name);
    $property_id = generatePropertyId($conn);
    $created_date_time = date("Y-m-d H:i:s");  // Get the current date and time

    $stmt = $conn->prepare("INSERT INTO properties (id, item_id, purchased_date, depreciation_date, supplier_id, amount, created_date_time) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sissdss", $property_id, $item_id, $purchased_date, $depreciation_date,  $supplier_id, $amount, $created_date_time);
    $stmt->execute();

    echo json_encode(["success" => true, "propertyId" => $property_id]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>