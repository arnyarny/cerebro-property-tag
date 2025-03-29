<?php
include 'db.php';
require 'vendor/autoload.php';

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $item_name = $_POST['item_name'] ?? null;
    $date = $_POST['date'] ?? null;
    $item_supplier = $_POST['item_supplier'] ?? null;
    $amount = $_POST['amount'] ?? null;

    if (empty($item_name) || empty($date) || empty($item_supplier) || empty($amount)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    if (isset($_POST['generate_qr'])) {
        $result = $conn->query("SELECT MAX(id) AS max_id FROM properties");
        $property_id = ($result->fetch_assoc()['max_id'] ?? 0) + 1;

        $qrData = "http://192.168.1.114:8000/cerebro-property-tag/get_property.php?id=" . $property_id;

        $options = new QROptions([
            'version'    => 10,
            'outputType' => QRCode::OUTPUT_IMAGE_PNG,
            'eccLevel'   => QRCode::ECC_M,
            'scale'      => 4,
        ]);

        $qrCode = new QRCode($options);
        $qrCodePath = "qr_codes/property_" . $property_id . ".png";

        if (!is_dir('qr_codes')) {
            mkdir('qr_codes', 0777, true);
        }

        $qrCode->render($qrData, $qrCodePath);

        echo json_encode(["success" => true, "qrCodePath" => $qrCodePath, "propertyId" => $property_id]);
        exit;
    }

    if (isset($_POST['save_property'])) {
        $qrCodePath = $_POST['qr_code_path'] ?? null;

        if (empty($qrCodePath)) {
            echo json_encode(["success" => false, "message" => "QR code path is required."]);
            exit;
        }

        $stmt = $conn->prepare("INSERT INTO properties (item_name, date, item_supplier, amount, qr_code) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssds", $item_name, $date, $item_supplier, $amount, $qrCodePath);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "filePath" => $qrCodePath]);
        } else {
            echo json_encode(["success" => false, "message" => "Database error: " . $stmt->error]);
        }
        exit;
    }
}

echo json_encode(["success" => false, "message" => "Invalid request."]);
?>

<form action="save_property.php" method="POST">
    <input type="hidden" name="save_property" value="1">
    <label for="item_name">Item Name:</label>
    <input type="text" id="item_name" name="item_name" required>
    <label for="date">Date:</label>
    <input type="date" id="date" name="date" required>
    <label for="item_supplier">Item Supplier:</label>
    <input type="text" id="item_supplier" name="item_supplier" required>
    <label for="amount">Amount:</label>
    <input type="number" id="amount" name="amount" step="0.01" required>
    <input type="hidden" id="qr_code_path" name="qr_code_path" value=""> <!-- Populate this dynamically -->
    <button type="submit">Generate and Save</button>
</form>
