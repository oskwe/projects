<?php
// employees_delete.php
include_once __DIR__ . '/../../db.php';
$id = $_GET['id'] ?? null;
if ($id) {
    executeQuery("DELETE FROM employees WHERE id = ?", [$id]);
}
header("Location: employees_view.php");
exit;
