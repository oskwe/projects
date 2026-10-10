<?php
include_once __DIR__ . '/../../db.php';

$vedomost_id = $_GET['id'] ?? null;
if (!$vedomost_id) {
    die("ID ведомости не указан.");
}

$vedomost = executeQuery("SELECT * FROM vedomost WHERE id = ?", [$vedomost_id])[0] ?? null;
if (!$vedomost) {
    die("Ведомость не найдена.");
}

$items = executeQuery("
    SELECT vb.id, p.name AS product_name, vb.quantity
    FROM vedomost_bodies vb
    JOIN products p ON vb.product_id = p.id
    WHERE vb.vedomost_id = ?", [$vedomost_id]);

$products = executeQuery("SELECT id, name FROM products");

// Добавление строки
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['product_id'], $_POST['quantity'])) {
    $product_id = $_POST['product_id'];
    $quantity = $_POST['quantity'];

    executeQuery("INSERT INTO vedomost_bodies (vedomost_id, product_id, quantity) VALUES (?, ?, ?)", [
        $vedomost_id, $product_id, $quantity
    ]);

    header("Location: vedomost_update.php?id=" . $vedomost_id);
    exit();
}

// Удаление строки
if (isset($_GET['delete_item_id'])) {
    $item_id = $_GET['delete_item_id'];
    executeQuery("DELETE FROM vedomost_bodies WHERE id = ?", [$item_id]);
    header("Location: vedomost_update.php?id=" . $vedomost_id);
    exit();
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактирование ведомости</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="styles.css" rel="stylesheet">
</head>
<body class="has-fixed-sidenav">
<header>
    <div class="navbar-fixed">
        <nav class="navbar blue">
            <div class="nav-wrapper">
                <ul class="left">
                    <li><a href="vedomost_view.php">Документы</a></li>
                    <li><a href="#">Товары</a></li>
                    <li><a href="#">Сотрудники</a></li>
                    <li><a href="#">Клиенты</a></li>
                    <li><a href="#">Организации</a></li>
                    <li><a href="#">Отчёты</a></li>
                </ul>
            </div>
        </nav>
    </div>
    <ul id="sidenav-left" class="sidenav sidenav-fixed">
        <li class="bold"><a href="proxy_view.php" class="waves-effect">Доверенности</a></li>
        <li class="bold"><a href="../vedomost/vedomost_view.php" class="waves-effect">Накладные на перемещение основных средств</a></li>
    </ul>
</header>
<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Редактирование ведомости №<?= htmlspecialchars($vedomost['document_number']) ?></h5>

        <div class="row">
            <div class="col s12 m6">
                <p><strong>Дата:</strong> <?= htmlspecialchars($vedomost['date']) ?></p>
            </div>
            <div class="col s12 m6">
                <p><strong>Комментарий:</strong> <?= htmlspecialchars($vedomost['comment']) ?></p>
            </div>
        </div>

        <h6 class="blue-text text-darken-2">Добавить товар</h6>
        <form method="post" class="row">
            <div class="input-field col s12 m6">
                <select name="product_id" required>
                    <option value="" disabled selected>Выберите товар</option>
                    <?php foreach ($products as $p): ?>
                        <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['name']) ?></option>
                    <?php endforeach; ?>
                </select>
                <label>Товар</label>
            </div>
            <div class="input-field col s12 m3">
                <input type="number" name="quantity" required min="1">
                <label>Количество</label>
            </div>
            <div class="input-field col s12 m3">
                <button type="submit" class="btn blue">Добавить</button>
            </div>
        </form>

        <table class="highlight striped">
            <thead>
            <tr>
                <th>Наименование</th>
                <th>Количество</th>
                <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <?php foreach ($items as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['product_name']) ?></td>
                    <td><?= htmlspecialchars($item['quantity']) ?></td>
                    <td>
                        <a href="?id=<?= $vedomost_id ?>&delete_item_id=<?= $item['id'] ?>" class="red-text" onclick="return confirm('Удалить товар из ведомости?');">
                            Удалить
                        </a>
                    </td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>

        <br>
        <a href="vedomost_view.php" class="btn-flat">Назад</a>
    </div>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        M.FormSelect.init(document.querySelectorAll('select'));
    });
</script>
</body>
</html>
