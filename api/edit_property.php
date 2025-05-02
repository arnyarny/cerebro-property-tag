<?php
include '../db/db.php';

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

// Define the getItemId function
function getItemId($conn, $item_name) {
    $stmt = $conn->prepare("SELECT item_id FROM items WHERE name = ?");
    $stmt->bind_param("s", $item_name);
    $stmt->execute();
    $item = $stmt->get_result()->fetch_assoc();
    return $item['item_id'] ?? null;
}

// Define the getSupplierId function
function getSupplierId($conn, $supplier_name) {
    $stmt = $conn->prepare("SELECT supplier_id FROM suppliers WHERE name = ?");
    $stmt->bind_param("s", $supplier_name);
    $stmt->execute();
    $supplier = $stmt->get_result()->fetch_assoc();
    return $supplier['supplier_id'] ?? null;
}

$propertyId = $_POST['propertyId'] ?? null;
$item_name = $_POST['item_name'] ?? null;
$purchased_date = $_POST['purchased_date'] ?? null;
$depreciation_date = $_POST['depreciation_date'] ?? null;
$supplier_name = $_POST['item_supplier'] ?? null;
$amount = $_POST['amount'] ?? null;

if (empty($propertyId) || empty($item_name) || empty($purchased_date) || empty($depreciation_date) || empty($supplier_name) || !isset($_POST['amount'])) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

try {
    // Get item_id, fail if it doesn't exist
    $item_id = getItemId($conn, $item_name);
    if (!$item_id) {
        echo json_encode(["success" => false, "message" => "Item does not exist."]);
        exit;
    }

    // Get supplier_id, fail if it doesn't exist
    $supplier_id = getSupplierId($conn, $supplier_name);
    if (!$supplier_id) {
        echo json_encode(["success" => false, "message" => "Supplier does not exist."]);
        exit;
    }

    // Update the property
    $stmt = $conn->prepare("UPDATE properties SET item_id = ?, purchased_date = ?, depreciation_date = ?, supplier_id = ?, amount = ? WHERE id = ?");
    $stmt->bind_param("isssds", $item_id, $purchased_date, $depreciation_date, $supplier_id, $amount, $propertyId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Property updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "No changes were made or property not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
