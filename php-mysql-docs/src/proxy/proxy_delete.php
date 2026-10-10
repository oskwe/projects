<?php
require_once __DIR__ . '/../../db.php';

// Проверка на наличие ID и его корректность
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die('Некорректный ID доверенности');
}

$proxyId = (int)$_GET['id'];

try {
    // Начало транзакции
    executeQuery("BEGIN");

    // Удаление связанных записей из proxy_bodies
    executeQuery("DELETE FROM proxy_bodies WHERE proxy_id = :id", ['id' => $proxyId]);

    // Удаление самой доверенности
    executeQuery("DELETE FROM proxies WHERE id = :id", ['id' => $proxyId]);

    // Подтверждение транзакции
    executeQuery("COMMIT");

    // Перенаправление обратно на список доверенностей
    header("Location: proxy_view.php");
    exit;
} catch (Exception $e) {
    // Откат транзакции в случае ошибки
    executeQuery("ROLLBACK");
    echo "Ошибка при удалении доверенности: " . $e->getMessage();
}
