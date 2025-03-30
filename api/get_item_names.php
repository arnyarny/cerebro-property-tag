<?php
include '../db/db.php';

header('Content-Type: application/json');

try {
    $result = $conn->query("SELECT DISTINCT name FROM items ORDER BY name ASC");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row['name'];
    }
    echo json_encode(["success" => true, "data" => $items]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>