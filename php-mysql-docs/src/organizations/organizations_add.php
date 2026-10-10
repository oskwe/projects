<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добавление организации</title>
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
        <h5 class="blue-text text-darken-2">Добавить организацию</h5>
        <form action="organizations_add_handler.php" method="POST">
            <div class="row">
                <div class="input-field col s12 m6">
                    <input id="name" name="name" type="text" required>
                    <label for="name">Наименование организации</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="address" name="address" type="text" required>
                    <label for="address">Адрес</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="account_id" name="account_id" type="number" required>
                    <label for="account_id">ID счета</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="chief" name="chief" type="text" required>
                    <label for="chief">Руководитель</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="financial_chief" name="financial_chief" type="text" required>
                    <label for="financial_chief">Финансовый руководитель</label>
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
