<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if ($id) {
    executeQuery("DELETE FROM products WHERE id = ?", [$id]);
}

header("Location: products_view.php");
exit;
