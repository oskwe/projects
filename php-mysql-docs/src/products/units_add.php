<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добавить единицу измерения</title>
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
                <li><a href="products_view.php">Товары</a></li>
                <li><a href="../employees/employees_view.php">Сотрудники</a></li>
                <li><a href="../customers/customers_view.php">Контрагенты</a></li>
                <li><a href="../organizations/organizations_view.php">Организации</a></li>
                <li><a href="../accounts/accounts_view.php">Счета</a></li>
            </ul>
        </div>
    </nav>
</div>

<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Товары</a></li>
    <li class="bold"><a href="products_view.php" class="waves-effect">Товары</a></li>
    <li class="bold"><a href="units_view.php" class="waves-effect">Ед. измерения</a></li>
</ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Добавить единицу измерения</h5>
        <form action="units_add_handler.php" method="POST">
            <div class="row">
                <div class="input-field col s12 m6">
                    <input id="name" name="name" type="text" required>
                    <label for="name">Наименование</label>
                </div>
            </div>
            <button type="submit" class="btn blue">
                <i class="material-icons left">check</i>СОХРАНИТЬ
            </button>
            <a href="units_view.php" class="btn-flat">ОТМЕНА</a>
        </form>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
</body>
</html>
