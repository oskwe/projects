<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if ($id) {
    executeQuery("DELETE FROM organizations WHERE id = ?", [$id]);
}

header("Location: organizations_view.php");
exit;
