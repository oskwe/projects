<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID не указан");
}

$account = executeQuery("SELECT * FROM accounts WHERE id = ?", [$id])[0] ?? null;
if (!$account) {
    die("Счёт не найден");
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактировать счёт</title>
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
                <li><a href="../documents/proxy_view.php">Документы</a></li>
                <li><a href="../products/products_view.php">Товары</a></li>
                <li><a href="../employees/employees_view.php">Сотрудники</a></li>
                <li><a href="../customers/customers_view.php">Контрагенты</a></li>
                <li><a href="../organizations/organizations_view.php">Организации</a></li>
                <li><a href="accounts_view.php">Счета</a></li>
            </ul>
        </div>
    </nav>
</div>

<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Справочники</a></li>
    <li class="bold"><a href="accounts_view.php" class="waves-effect">Счета</a></li>
</ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Редактировать счёт</h5>

        <form action="accounts_edit_handler.php" method="POST">
            <input type="hidden" name="id" value="<?= htmlspecialchars($account['id']) ?>">

            <div class="row">
                <div class="input-field col s12 m6">
                    <input id="bank_name" name="bank_name" type="text" value="<?= htmlspecialchars($account['bank_name']) ?>" required>
                    <label class="active" for="bank_name">Имя банка</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="account" name="account" type="text" value="<?= htmlspecialchars($account['account']) ?>" required>
                    <label class="active" for="account">Рассчётный счёт</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="bank_identity_number" name="bank_identity_number" type="text" value="<?= htmlspecialchars($account['bank_identity_number']) ?>" required>
                    <label class="active" for="bank_identity_number">БИК</label>
                </div>
            </div>

            <button type="submit" class="btn blue"><i class="material-icons left">save</i>СОХРАНИТЬ</button>
            <a href="accounts_view.php" class="btn-flat">ОТМЕНА</a>
        </form>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>
</html>
