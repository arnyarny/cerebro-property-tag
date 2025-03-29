<?php
include 'db.php';

// Fetch properties from the database, including specific columns
$sql = "SELECT id, item_name, date, item_supplier, amount FROM properties";
$result = $conn->query($sql);

if (!$result) {
    // Log error if query fails
    error_log("Database query failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch properties"]);
    exit;
}

$properties = [];
while ($row = $result->fetch_assoc()) {
    if (!isset($row['id'])) {
        // Log error if 'id' is missing in the row
        error_log("Missing 'id' in database row: " . json_encode($row));
    }
    $properties[] = $row; // Include id and other columns in the response
}

header('Content-Type: application/json');
echo json_encode($properties); // Return properties as JSON
?>
