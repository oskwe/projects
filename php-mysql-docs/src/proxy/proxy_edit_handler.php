<?php
include_once __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $proxy_id = $_POST['proxy_id'];
    $org_id = $_POST['organization_id'];
    $cust_id = $_POST['customer_id'];
    $emp_id = $_POST['employee_id'];
    $date_issue = $_POST['date_of_issue'];
    $date_valid = $_POST['is_valid_until'];

    if (!$proxy_id || !$org_id || !$cust_id || !$emp_id || !$date_issue || !$date_valid) {
        die("Все поля обязательны.");
    }

    // Обновление доверенности
    executeQuery("UPDATE proxies SET organization_id=?, customer_id=?, employee_id=?, date_of_issue=?, is_valid_until=? WHERE id=?",
        [$org_id, $cust_id, $emp_id, $date_issue, $date_valid, $proxy_id]);

    // Удаление старых записей товаров
    executeQuery("DELETE FROM proxy_bodies WHERE proxy_id=?", [$proxy_id]);

    // Добавление новых
    if (!empty($_POST['product_id']) && is_array($_POST['product_id'])) {
        foreach ($_POST['product_id'] as $index => $product_id) {
            $amount = $_POST['product_amount'][$index];
            if (is_numeric($product_id) && is_numeric($amount) && $amount > 0) {
                executeQuery("INSERT INTO proxy_bodies (product_id, proxy_id, product_amount) VALUES (?, ?, ?)", [
                    $product_id, $proxy_id, $amount
                ]);
            }
        }
    }

    header("Location: proxy_view.php?updated=1");
    exit;
} else {
    http_response_code(405);
    echo "Метод не поддерживается.";
}
