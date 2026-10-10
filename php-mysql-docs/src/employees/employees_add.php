<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добавление сотрудника</title>
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
                <li><a href="employees_view.php">Сотрудники</a></li>
                <li><a href="../customers/customers_view.php">Контрагенты</a></li>
                <li><a href="../organizations/organizations_view.php">Организации</a></li>
                <li><a href="../accounts/accounts_view.php">Счета</a></li>
            </ul>
        </div>
    </nav>
</div>
<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Справочники</a></li>
    <li class="bold"><a href="employees_view.php" class="waves-effect">Сотрудники</a></li>
</ul>
</header>
<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Добавить сотрудника</h5>
        <form action="employees_add_handler.php" method="POST">
            <div class="row">
                <div class="input-field col s12 m4">
                    <input id="last_name" name="last_name" type="text" required>
                    <label for="last_name">Фамилия</label>
                </div>
                <div class="input-field col s12 m4">
                    <input id="first_name" name="first_name" type="text" required>
                    <label for="first_name">Имя</label>
                </div>
                <div class="input-field col s12 m4">
                    <input id="middle_name" name="middle_name" type="text">
                    <label for="middle_name">Отчество</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="post" name="post" type="text" required>
                    <label for="post">Должность</label>
                </div>
                <div class="input-field col s12 m3">
                    <input id="passport_series" name="passport_series" type="text" maxlength="4" required>
                    <label for="passport_series">Серия паспорта</label>
                </div>
                <div class="input-field col s12 m3">
                    <input id="passport_number" name="passport_number" type="text" maxlength="6" required>
                    <label for="passport_number">Номер паспорта</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="passport_issued_by" name="passport_issued_by" type="text" required>
                    <label for="passport_issued_by">Кем выдан паспорт</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="passport_date_of_issue" name="passport_date_of_issue" type="date" required>
                    <label for="passport_date_of_issue" class="active">Дата выдачи паспорта</label>
                </div>
            </div>
            <button type="submit" class="btn blue"><i class="material-icons left">check</i>СОХРАНИТЬ</button>
            <a href="employees_view.php" class="btn-flat">ОТМЕНА</a>
        </form>
    </div>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  M.updateTextFields();
});
</script>
</body>
</html>
