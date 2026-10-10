<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$name = $_POST['name'] ?? '';
$address = $_POST['address'] ?? '';
$account_id = $_POST['account_id'] ?? null;
$chief = $_POST['chief'] ?? '';
$financial_chief = $_POST['financial_chief'] ?? '';

if ($id && $name && $address && $account_id && $chief && $financial_chief) {
    executeQuery("
        UPDATE organizations
        SET name = ?, address = ?, account_id = ?, chief = ?, financial_chief = ?
        WHERE id = ?
    ", [$name, $address, $account_id, $chief, $financial_chief, $id]);
}

header("Location: organizations_view.php");
exit;
