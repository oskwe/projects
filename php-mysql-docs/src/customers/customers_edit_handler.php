<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? null;

if (!$id || !$name) {
    die("Не все поля заполнены");
}

executeQuery("UPDATE customers SET name = ? WHERE id = ?", [$name, $id]);

header("Location: customers_view.php");
exit;
?>


// customers_delete.php

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
