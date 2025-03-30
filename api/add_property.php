<?php
ob_start();
include '../db/db.php'; // Updated path to db.php
require '../vendor/autoload.php'; // Updated path to vendor

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $item_name = $_POST['item_name'] ?? null;
    $date = $_POST['date'] ?? null;
    $supplier_name = $_POST['item_supplier'] ?? null;
    $amount = $_POST['amount'] ?? null;

    if (empty($item_name) || empty($date) || empty($supplier_name) || empty($amount)) {
        ob_clean();
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit;
    }

    try {
        // Check or insert item
        $stmt = $conn->prepare("SELECT item_id FROM items WHERE name = ?");
        $stmt->bind_param("s", $item_name);
        $stmt->execute();
        $item = $stmt->get_result()->fetch_assoc();
        $item_id = $item['item_id'] ?? null;

        if (!$item_id) {
            $insertItemStmt = $conn->prepare("INSERT INTO items (name) VALUES (?)");
            $insertItemStmt->bind_param("s", $item_name);
            $insertItemStmt->execute();
            $item_id = $insertItemStmt->insert_id;
        }

        // Check or insert supplier
        $stmt = $conn->prepare("SELECT supplier_id FROM suppliers WHERE name = ?");
        $stmt->bind_param("s", $supplier_name);
        $stmt->execute();
        $supplier = $stmt->get_result()->fetch_assoc();
        $supplier_id = $supplier['supplier_id'] ?? null;

        if (!$supplier_id) {
            $insertSupplierStmt = $conn->prepare("INSERT INTO suppliers (name) VALUES (?)");
            $insertSupplierStmt->bind_param("s", $supplier_name);
            $insertSupplierStmt->execute();
            $supplier_id = $insertSupplierStmt->insert_id;
        }

        // Generate property ID
        $result = $conn->query("SELECT id FROM properties ORDER BY id DESC LIMIT 1");
        $row = $result->fetch_assoc();
        $newId = $row ? (int)substr($row['id'], 4) + 1 : 1;
        $property_id = "2025" . str_pad($newId, 4, "0", STR_PAD_LEFT);

        // Insert property
        $stmt = $conn->prepare("INSERT INTO properties (id, item_id, date, supplier_id, amount) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sissd", $property_id, $item_id, $date, $supplier_id, $amount);
        $stmt->execute();

        // Generate QR code
        $serverIp = $_SERVER['HTTP_HOST']; // Dynamically get the server's IP address
        $qrData = "http://$serverIp:8000/cerebro-property-tag/get_property.php?id=" . $property_id;
        $templatePath = '../templates/cerebro_property_id.png';
        if (!file_exists($templatePath)) throw new Exception("Template image not found.");

        $options = new QROptions(['version' => 10, 'outputType' => QRCode::OUTPUT_IMAGE_PNG, 'eccLevel' => QRCode::ECC_M, 'scale' => 4]);
        $qrCode = new QRCode($options);
        $qrImage = $qrCode->render($qrData);

        $template = imagecreatefrompng($templatePath);
        $qrCodeImage = imagecreatefromstring($qrImage);
        $x = (imagesx($template) - imagesx($qrCodeImage)) / 2;
        $y = (imagesy($template) - imagesy($qrCodeImage)) / 2;
        imagecopy($template, $qrCodeImage, $x, $y, 0, 0, imagesx($qrCodeImage), imagesy($qrCodeImage));

        $qrCodesDir = 'qr_codes';
        if (!is_dir($qrCodesDir) && !mkdir($qrCodesDir, 0777, true)) throw new Exception("Failed to create QR codes directory.");
        $qrCodePath = $qrCodesDir . "/property_" . $property_id . ".png";
        if (!imagepng($template, $qrCodePath)) throw new Exception("Failed to save QR code image.");

        imagedestroy($template);
        imagedestroy($qrCodeImage);

        // Update property with QR code path
        $updateStmt = $conn->prepare("UPDATE properties SET qr_code = ? WHERE property_id = ?");
        $updateStmt->bind_param("ss", $qrCodePath, $property_id);
        $updateStmt->execute();

        ob_clean();
        echo json_encode(["success" => true, "qrCodePath" => $qrCodePath, "propertyId" => $property_id]);
        exit;
    } catch (Exception $e) {
        error_log($e->getMessage());
        ob_clean();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode(["success" => false, "message" => "Invalid request."]);
?>