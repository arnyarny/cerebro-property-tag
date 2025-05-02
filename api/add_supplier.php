<?php
include '../db/db.php';

header('Content-Type: application/json');

$name = $_POST['name'] ?? null;
$created_date_time = date("Y-m-d H:i:s");  // Get the current date and time

if (!$name) {
    echo json_encode(["success" => false, "message" => "Supplier name is required."]);
    exit;
}

try {
    // Insert a placeholder entry into the properties table with the new supplier
    $stmt = $conn->prepare("INSERT INTO suppliers (name, created_date_time) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $created_date_time);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        throw new Exception("Failed to add supplier.");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
