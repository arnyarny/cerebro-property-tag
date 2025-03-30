<?php
include '../db/db.php';

if (!isset($_GET['id']) || empty($_GET['id'])) {
    die("Property ID is required.");
}

$property_id = intval($_GET['id']); // Sanitize the input

// Fetch property details from the database
$sql = "SELECT item_name, date, item_supplier, amount, qr_code FROM properties WHERE id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    die("Database error: " . $conn->error);
}

$stmt->bind_param("i", $property_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Property not found.");
}

$property = $result->fetch_assoc();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Property Details</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Property Details</h1>
    <div class="property-details">
        <p><strong>Item Name:</strong> <?php echo htmlspecialchars($property['item_name']); ?></p>
        <p><strong>Date:</strong> <?php echo htmlspecialchars($property['date']); ?></p>
        <p><strong>Supplier:</strong> <?php echo htmlspecialchars($property['item_supplier']); ?></p>
        <p><strong>Amount:</strong> <?php echo htmlspecialchars($property['amount']); ?></p>
        <p><strong>QR Code:</strong></p>
        <img src="<?php echo htmlspecialchars($property['qr_code']); ?>" alt="QR Code" style="width: 200px; height: 200px;">
    </div>
</body>
</html>
