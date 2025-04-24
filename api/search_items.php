<?php
include '../db/db.php';

header('Content-Type: application/json');

$term = $_GET['q'] ?? '';

if (!$term) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("SELECT name FROM items WHERE name LIKE CONCAT('%', ?, '%') LIMIT 10");
$stmt->bind_param("s", $term);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row['name'];
}

echo json_encode($items);
