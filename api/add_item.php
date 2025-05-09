<?php
include '../db/db.php';

header('Content-Type: application/json');

$name = $_POST['name'] ?? null;

// Get the current date and time
$created_date_time = date("Y-m-d H:i:s");

if (!$name) {
    echo json_encode(["success" => false, "message" => "Item name is required."]);
    exit;
}

try {
    // Insert a placeholder entry into the items table with the new item name
    $stmt = $conn->prepare("INSERT INTO items (name, created_date_time) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $created_date_time);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        throw new Exception("Failed to add item.");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>