<?php
include '../db/db.php'; // Updated path to db.php

// Fetch properties with item and supplier names
$sql = "
    SELECT 
        p.id AS id, 
        i.name AS item_name, 
        p.date, 
        s.name AS item_supplier, 
        p.amount 
    FROM 
        properties p
    INNER JOIN 
        items i ON p.item_id = i.item_id
    INNER JOIN 
        suppliers s ON p.supplier_id = s.supplier_id
";
$result = $conn->query($sql);

if (!$result) {
    error_log("Database query failed: " . $conn->error);
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch properties"]);
    exit;
}

$properties = [];
while ($row = $result->fetch_assoc()) {
    $properties[] = $row;
}

header('Content-Type: application/json');
echo json_encode($properties);
?>