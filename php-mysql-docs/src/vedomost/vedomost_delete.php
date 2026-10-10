<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    die("ID не указан.");
}

// Удаляем сначала позиции
executeQuery("DELETE FROM vedomost_items WHERE vedomost_id = ?", [$id]);

// Удаляем авансовый отчет
executeQuery("DELETE FROM vedomost WHERE id = ?", [$id]);

header("Location: vedomost_view.php");
exit;