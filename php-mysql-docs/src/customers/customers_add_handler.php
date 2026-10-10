<?php
include_once __DIR__ . '/../../db.php';

$name = $_POST['name'] ?? null;

if (!$name) {
    die("Поле не заполнено");
}

executeQuery("INSERT INTO customers (name) VALUES (?)", [$name]);

header("Location: customers_view.php");
exit;
?>