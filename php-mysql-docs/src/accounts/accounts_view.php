<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Счета — Просмотр</title>
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
                <li><a href="../organizations/organizations_view.php">Организации</a></li>
                <li><a href="accounts_view.php">Счета</a></li>
                <li><a href="../assets/assets_view.php">Основные средства</a></li>
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
        <h5 class="blue-text text-darken-2">Счета</h5>
        <a href="accounts_add.php" class="btn-flat blue-text text-darken-2"><i class="material-icons left">add</i>ДОБАВИТЬ</a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>Имя банка</th>
                    <th>Рассчётный счёт</th>
                    <th>БИК</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php
                include_once __DIR__ . '/../../db.php';

                $accounts = executeQuery("
                    SELECT id, bank_name, account, bank_identity_number 
                    FROM accounts
                ");

                foreach ($accounts as $acc) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($acc['bank_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($acc['account']) . '</td>';
                    echo '<td>' . htmlspecialchars($acc['bank_identity_number']) . '</td>';
                    echo '<td>
                            <a href="accounts_delete.php?id=' . $acc['id'] . '" class="btn-small red" onclick="return confirm(\'Удалить счёт?\')"><i class="material-icons">delete</i></a>
                            <a href="accounts_edit.php?id=' . $acc['id'] . '" class="btn-small orange"><i class="material-icons">edit</i></a>
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
