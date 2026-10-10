<?php
include_once __DIR__ . '/../../db.php';

$name = $_POST['name'] ?? '';

if ($name) {
    executeQuery("INSERT INTO units (name) VALUES (?)", [$name]);
}

header("Location: units_view.php");
exit;
