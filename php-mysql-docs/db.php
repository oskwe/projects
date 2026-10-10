<?php
require_once 'config.php';

function getPDO(): PDO {
    static $pdo;

    if (!$pdo) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            die("Ошибка подключения к БД: " . $e->getMessage());
        }
    }

    return $pdo;
}

// Выполнение SELECT-запроса
function executeQuery(string $sql, array $params = []): array {
    $stmt = getPDO()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Выполнение INSERT/UPDATE/DELETE-запроса
function executeNonQuery(string $sql, array $params = []): bool {
    $stmt = getPDO()->prepare($sql);
    return $stmt->execute($params);
}

// Получение ID последней вставленной записи
function lastInsertId(): string {
    return getPDO()->lastInsertId();
}

function fetchOne(string $sql, array $params = []) {
    $stmt = getPDO()->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

