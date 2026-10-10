<?php
include_once __DIR__ . '/../../db.php';

$name = $_POST['name'] ?? '';
$address = $_POST['address'] ?? '';
$account_id = $_POST['account_id'] ?? null;
$chief = $_POST['chief'] ?? '';
$financial_chief = $_POST['financial_chief'] ?? '';

if ($name && $address && $account_id && $chief && $financial_chief) {
    executeQuery("
        INSERT INTO organizations (name, address, account_id, chief, financial_chief)
        VALUES (?, ?, ?, ?, ?)
    ", [$name, $address, $account_id, $chief, $financial_chief]);
}

header("Location: organizations_view.php");
exit;
