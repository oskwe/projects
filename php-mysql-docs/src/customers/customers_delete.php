<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID не указан");
}

executeQuery("DELETE FROM customers WHERE id = ?", [$id]);

header("Location: customers_view.php");
exit;
?>
