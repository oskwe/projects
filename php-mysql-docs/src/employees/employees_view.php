<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Сотрудники — Просмотр</title>
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
                <li><a href="../assets/assets_view.php">Основные средства</a></li>
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
        <h5 class="blue-text text-darken-2">Сотрудники</h5>
        <a href="employees_add.php" class="btn-flat blue-text text-darken-2"><i class="material-icons left">add</i>ДОБАВИТЬ</a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Должность</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php
                include_once __DIR__ . '/../../db.php';

                $employees = executeQuery("
                    SELECT id, last_name, first_name, middle_name, post 
                    FROM employees
                ");

                foreach ($employees as $emp) {
                    $fullName = htmlspecialchars($emp['last_name'] . ' ' . $emp['first_name'] . ' ' . $emp['middle_name']);
                    echo '<tr>';
                    echo '<td>' . $fullName . '</td>';
                    echo '<td>' . htmlspecialchars($emp['post']) . '</td>';
                    echo '<td>
                            <a href="employees_delete.php?id=' . $emp['id'] . '" class="btn-small red" onclick="return confirm(\'Удалить сотрудника?\')"><i class="material-icons">delete</i></a>
                            <a href="employees_edit.php?id=' . $emp['id'] . '" class="btn-small orange"><i class="material-icons">edit</i></a>
                          </td>';
                    echo '</tr>';
                }
                ?>
            </tbody>
        </table>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        var elems = document.querySelectorAll('.sidenav');
        M.Sidenav.init(elems);
    });
</script>
</body>
</html>
