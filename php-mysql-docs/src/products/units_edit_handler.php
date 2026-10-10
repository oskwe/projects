<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';

if ($id && $name) {
    executeQuery("UPDATE units SET name = ? WHERE id = ?", [$name, $id]);
}

header("Location: units_view.php");
exit;
