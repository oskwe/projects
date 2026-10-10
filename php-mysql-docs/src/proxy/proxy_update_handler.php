<?php
include_once __DIR__ . '/../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Получение данных из формы
    $org_id = $_POST['organization_id'] ?? null;
    $cust_id = $_POST['customer_id'] ?? null;
    $emp_id = $_POST['employee_id'] ?? null;
    $date_issue = $_POST['date_of_issue'] ?? null;
    $date_valid = $_POST['is_valid_until'] ?? null;

    // Проверка обязательных полей
    if (!$org_id || !$cust_id || !$emp_id || !$date_issue || !$date_valid) {
        die('Не все обязательные поля заполнены.');
    }

    // Вставка в таблицу proxies
    $insertProxySQL = "INSERT INTO proxies (organization_id, customer_id, employee_id, date_of_issue, is_valid_until)
                       VALUES (?, ?, ?, ?, ?)";
    executeNonQuery($insertProxySQL, [$org_id, $cust_id, $emp_id, $date_issue, $date_valid]);

    // Получаем ID только что добавленной доверенности
    $proxy_id = lastInsertId();

    // Если переданы товары — добавляем в proxy_bodies
    if (!empty($_POST['product_id']) && is_array($_POST['product_id'])) {
        $product_ids = $_POST['product_id'];
        $amounts = $_POST['product_amount'];

        foreach ($product_ids as $index => $product_id) {
            $amount = $amounts[$index];

            // Пропускаем пустые или некорректные строки
            if (!is_numeric($product_id) || !is_numeric($amount) || $amount <= 0) {
                continue;
            }

            $insertBodySQL = "INSERT INTO proxy_bodies (product_id, proxy_id, product_amount)
                              VALUES (?, ?, ?)";
            executeNonQuery($insertBodySQL, [$product_id, $proxy_id, $amount]);
        }
    }

    // Перенаправление после успешного добавления
    header("Location: proxy_view.php?success=1");
    exit;
} else {
    // Если запрос не POST, возвращаем ошибку
    http_response_code(405);
    echo "Метод не поддерживается.";
}
