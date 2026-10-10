<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';
$price = $_POST['price'] ?? 0;
$unit_id = $_POST['unit_id'] ?? null;

if ($id && $name && $price && $unit_id) {
    executeQuery("
        UPDATE products
        SET name = ?, price = ?, unit_id = ?
        WHERE id = ?
    ", [$name, $price, $unit_id, $id]);
}

header("Location: products_view.php");
exit;
