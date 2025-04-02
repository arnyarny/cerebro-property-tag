<?php
include '../db/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$propertyId = $_GET['id'] ?? null; // Retrieve the id from the query string

if (!$propertyId) {
    echo json_encode(["success" => false, "message" => "Property ID is required."]);
    exit;
}

try {
    $stmt = $conn->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->bind_param("s", $propertyId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Property deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Property not found."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
