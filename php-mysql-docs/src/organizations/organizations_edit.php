<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) die('ID не указан');

$organization = executeQuery("SELECT * FROM organizations WHERE id = ?", [$id])[0] ?? null;
if (!$organization) die('Организация не найдена');
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактирование организации</title>
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
                <li><a href="../proxy/proxy_view.php">Документы</a></li>
                <li><a href="../products/products_view.php">Товары</a></li>
                <li><a href="../employees/employees_view.php">Сотрудники</a></li>
                <li><a href="../customers/customers_view.php">Контрагенты</a></li>
                <li><a href="organizations_view.php">Организации</a></li>
                <li><a href="../accounts/accounts_view.php">Счета</a></li>
            </ul>
        </div>
    </nav>
</div>
<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Справочники</a></li>
    <li class="bold"><a href="organizations_view.php" class="waves-effect">Организации</a></li>
</ul>
</header>
<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Редактировать организацию</h5>
        <form action="organizations_edit_handler.php" method="POST">
            <input type="hidden" name="id" value="<?= htmlspecialchars($organization['id']) ?>">
            <div class="row">
                <div class="input-field col s12 m6">
                    <input id="name" name="name" type="text" value="<?= htmlspecialchars($organization['name']) ?>" required>
                    <label class="active" for="name">Наименование организации</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="address" name="address" type="text" value="<?= htmlspecialchars($organization['address']) ?>" required>
                    <label class="active" for="address">Адрес</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="account_id" name="account_id" type="number" value="<?= htmlspecialchars($organization['account_id']) ?>" required>
                    <label class="active" for="account_id">ID счета</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="chief" name="chief" type="text" value="<?= htmlspecialchars($organization['chief']) ?>" required>
                    <label class="active" for="chief">Руководитель</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="financial_chief" name="financial_chief" type="text" value="<?= htmlspecialchars($organization['financial_chief']) ?>" required>
                    <label class="active" for="financial_chief">Финансовый руководитель</label>
                </div>
            </div>
            <button type="submit" class="btn blue">
                <i class="material-icons left">check</i>СОХРАНИТЬ
            </button>
            <a href="organizations_view.php" class="btn-flat">ОТМЕНА</a>
        </form>
    </div>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>
</html>
