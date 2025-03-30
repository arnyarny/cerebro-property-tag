<?php
include '../db/db.php';

header('Content-Type: application/json');

try {
    $result = $conn->query("SELECT DISTINCT name FROM suppliers ORDER BY name ASC");
    $suppliers = [];
    while ($row = $result->fetch_assoc()) {
        $suppliers[] = $row['name'];
    }
    echo json_encode(["success" => true, "data" => $suppliers]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
