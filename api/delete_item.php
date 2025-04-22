<?php
include '../db/db.php';
header('Content-Type: application/json');

// Check if the request method is DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
    exit;
}

$itemId = $_GET['id'] ?? null;

if (!$itemId) {
    echo json_encode(["success" => false, "message" => "Item ID is required."]);
    exit;
}

// Debugging: Check if the connection is valid
if (!$conn) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

try {
    // Debugging: Log the itemId to verify the value
    error_log("Item ID for deletion: " . $itemId);

    // Prepare the SQL query for item deletion
    $stmt = $conn->prepare("DELETE FROM items WHERE item_id = ?");
    
    if ($stmt === false) {
        // Handle error if the prepare statement failed
        echo json_encode([
            "success" => false, 
            "message" => "Failed to prepare the SQL query: " . $conn->error
        ]);
        exit;
    }

    // Bind the parameter
    $stmt->bind_param("s", $itemId);

    // Execute the query
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(["success" => true, "message" => "Item deleted successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Item not found or already deleted."]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
