<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;

if ($id) {
    executeQuery("DELETE FROM units WHERE id = ?", [$id]);
}

header("Location: units_view.php");
exit;
