<?php
include_once __DIR__ . '/../../db.php';

$name = $_POST['name'] ?? '';
$price = $_POST['price'] ?? 0;
$unit_id = $_POST['unit_id'] ?? null;

if ($name && $price && $unit_id) {
    executeQuery("
        INSERT INTO products (name, price, unit_id)
        VALUES (?, ?, ?)
    ", [$name, $price, $unit_id]);
}

header("Location: products_view.php");
exit;
