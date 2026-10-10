<?php
include_once __DIR__ . '/../../db.php';

$id = $_POST['id'] ?? null;
$bank_name = $_POST['bank_name'] ?? null;
$account = $_POST['account'] ?? null;
$bank_identity_number = $_POST['bank_identity_number'] ?? null;

if (!$id || !$bank_name || !$account || !$bank_identity_number) {
    die("Не все поля заполнены");
}

executeQuery(
    "UPDATE accounts SET bank_name = ?, account = ?, bank_identity_number = ? WHERE id = ?",
    [$bank_name, $account, $bank_identity_number, $id]
);

header("Location: accounts_view.php");
exit;
?>
