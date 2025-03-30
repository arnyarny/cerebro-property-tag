<?php
include '../db/db.php';

header('Content-Type: application/json');

$name = $_POST['name'] ?? null;

if (!$name) {
    echo json_encode(["success" => false, "message" => "Item name is required."]);
    exit;
}

try {
    // Insert a placeholder entry into the properties table with the new item name
    $stmt = $conn->prepare("INSERT INTO items (name) VALUES (?)");
    $stmt->bind_param("s", $name);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        throw new Exception("Failed to add item.");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
