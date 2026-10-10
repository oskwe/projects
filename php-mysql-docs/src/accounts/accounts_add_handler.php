<?php
include_once __DIR__ . '/../../db.php';

$bank_name = $_POST['bank_name'] ?? null;
$account = $_POST['account'] ?? null;
$bank_identity_number = $_POST['bank_identity_number'] ?? null;

if (!$bank_name || !$account || !$bank_identity_number) {
    die("Не все поля заполнены");
}

executeQuery(
    "INSERT INTO accounts (bank_name, account, bank_identity_number) VALUES (?, ?, ?)",
    [$bank_name, $account, $bank_identity_number]
);

header("Location: accounts_view.php");
exit;
?>
