<?php
include '../db/db.php';

header('Content-Type: application/json');

$name = $_POST['name'] ?? null;

if (!$name) {
    echo json_encode(["success" => false, "message" => "Supplier name is required."]);
    exit;
}

try {
    // Insert a placeholder entry into the properties table with the new supplier
    $stmt = $conn->prepare("INSERT INTO suppliers (name) VALUES (?)");
    $stmt->bind_param("s", $name);
    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        throw new Exception("Failed to add supplier.");
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
