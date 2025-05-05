<?php
include '../db/db.php';
header('Content-Type: application/json');

$itemId = $_POST['itemId'] ?? null;
$itemName = $_POST['name'] ?? null;

if (!$itemId || !$itemName) {
    echo json_encode(["success" => false, "message" => "Item ID and Name are required."]);
    exit;
}

try {
    // Update the item name
    $stmt = $conn->prepare("UPDATE items SET name = ? WHERE item_id = ?");
    $stmt->bind_param("si", $itemName, $itemId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Item updated successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "No changes made or item not found."]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
