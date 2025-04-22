<?php
include '../db/db.php';
header('Content-Type: application/json');

$item_id = $_GET['id'] ?? null; // Get the item_id from the URL query parameter

if (empty($item_id)) {
    echo json_encode(["success" => false, "message" => "Item ID is required."]);
    exit;
}

try {
    // Query to fetch a single item by item_id
    $stmt = $conn->prepare("SELECT item_id, name FROM items WHERE item_id = ?");
    $stmt->bind_param("i", $item_id);
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if the item exists
    if ($result->num_rows > 0) {
        $item = $result->fetch_assoc();
        echo json_encode(["success" => true, "item" => $item]);
    } else {
        echo json_encode(["success" => false, "message" => "Item not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
