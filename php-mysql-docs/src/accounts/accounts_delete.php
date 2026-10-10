<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID не указан");
}

executeQuery("DELETE FROM accounts WHERE id = ?", [$id]);

header("Location: accounts_view.php");
exit;
?>
