<?php
include '../db/db.php';

header('Content-Type: application/json');

// Get the search query
$query = $_GET['q'] ?? '';

// Validate query
if (empty($query)) {
    echo json_encode([]);
    exit;
}

try {
    // Prepare the SQL query to search for suppliers by name
    $stmt = $conn->prepare("SELECT name FROM suppliers WHERE name LIKE ?");
    $searchTerm = "%" . $query . "%";  // Add wildcards for partial match
    $stmt->bind_param("s", $searchTerm);
    $stmt->execute();
    
    // Fetch results
    $result = $stmt->get_result();
    $suppliers = [];

    // Fetch all matching suppliers
    while ($row = $result->fetch_assoc()) {
        $suppliers[] = $row['name'];
    }

    echo json_encode($suppliers);

} catch (Exception $e) {
    // Handle any error (e.g., DB connection error)
    echo json_encode(["error" => "Failed to search suppliers. " . $e->getMessage()]);
}
?>