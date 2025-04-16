<?php
include '../db/db.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT supplier_id, name FROM suppliers ORDER BY name ASC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("SQL Error: " . $conn->error);
    }

    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }

    echo json_encode(["success" => true, "data" => $items]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
