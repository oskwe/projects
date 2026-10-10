<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Доверенности — Просмотр</title>
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
                <li><a href="proxy_view.php">Документы</a></li>
                <li><a href="../products/products_view.php">Товары</a></li>
                <li><a href="../employees/employees_view.php">Сотрудники</a></li>
                <li><a href="../customers/customers_view.php">Контрагенты</a></li>
                <li><a href="../organizations/organizations_view.php">Организации</a></li>
                <li><a href="../accounts/accounts_view.php">Счета</a></li>
                <li><a href="../assets/assets_view.php">Основные средства</a></li>
            </ul>
        </div>
    </nav>
</div>


    <ul id="sidenav-left" class="sidenav sidenav-fixed">
        <li><a class="subheader">Документы</a></li>
        <li class="bold"><a href="proxy_view.php" class="waves-effect">Доверенности</a></li>
        <li class="bold"><a href="../vedomost/vedomost_view.php" class="waves-effect">Накладные на перемещение основных средств</a></li>
    </ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Доверенности</h5>
        <a href="proxy_add.php" class="btn-flat blue-text text-darken-2"><i class="material-icons left">add</i>ДОБАВИТЬ</a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>ID организации</th>
                    <th>ID клиента</th>
                    <th>ID сотрудника</th>
                    <th>Дата выдачи</th>
                    <th>Действительна до</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php
                include_once __DIR__ . '/../../db.php';

                $proxies = executeQuery("
                    SELECT 
                        p.id,
                        o.name AS organization_name,
                        c.name AS customer_name,
                        e.first_name AS first_employee_name,
                        e.last_name AS last_employee_name,
                        e.middle_name AS middle_employee_name,
                        p.date_of_issue,
                        p.is_valid_until
                    FROM proxies p
                    JOIN organizations o ON p.organization_id = o.id
                    JOIN customers c ON p.customer_id = c.id
                    JOIN employees e ON p.employee_id = e.id
                ");

                foreach ($proxies as $proxy) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($proxy['id']) . '</td>';
                    echo '<td>' . htmlspecialchars($proxy['organization_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($proxy['customer_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($proxy['last_employee_name'].' '.$proxy['first_employee_name'].' '.$proxy['middle_employee_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($proxy['date_of_issue']) . '</td>';
                    echo '<td>' . htmlspecialchars($proxy['is_valid_until']) . '</td>';
                    echo '<td>
                            <a href="proxy_delete.php?id=' . $proxy['id'] . '" class="btn-small red" onclick="return confirm(\'Удалить доверенность?\')"><i class="material-icons">delete</i></a>
                            <a href="proxy_edit.php?id=' . $proxy['id'] . '" class="btn-small orange"><i class="material-icons">edit</i></a>
                            <a href="proxy_details.php?id=' . $proxy['id'] . '" class="btn-small blue"><i class="material-icons">visibility</i></a>
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
