<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Основные средства — Просмотр</title>
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
                <li><a href="../accounts/accounts_view.php">Счета</a></li>
                <li><a href="assets_view.php">Основные средства</a></li>
            </ul>
        </div>
    </nav>
</div>

<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Основные средства</a></li>
    <li class="bold"><a href="assets_view.php" class="waves-effect">Список ОС</a></li>
</ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Основные средства</h5>
        <a href="assets_add.php" class="btn-flat blue-text text-darken-2"><i class="material-icons left">add</i>ДОБАВИТЬ</a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>Наименование</th>
                    <th>Инвентарный №</th>
                    <th>Дата приобретения</th>
                    <th>Цена</th>
                    <th>Ед. измерения</th>
                    <th>Описание</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php
                include_once __DIR__ . '/../../db.php';

                $assets = executeQuery("
                    SELECT a.id, a.name, a.inventory_number, a.acquisition_date, a.price, a.description, u.name AS unit_name
                    FROM assets a
                    JOIN units u ON a.unit_id = u.id
                ");

                foreach ($assets as $asset) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($asset['name']) . '</td>';
                    echo '<td>' . htmlspecialchars($asset['inventory_number']) . '</td>';
                    echo '<td>' . htmlspecialchars($asset['acquisition_date']) . '</td>';
                    echo '<td>' . htmlspecialchars($asset['price']) . '</td>';
                    echo '<td>' . htmlspecialchars($asset['unit_name']) . '</td>';
                    echo '<td>' . htmlspecialchars($asset['description']) . '</td>';
                    echo '<td>
                            <a href="assets_delete.php?id=' . $asset['id'] . '" class="btn-small red" onclick="return confirm(\'Удалить основное средство?\')"><i class="material-icons">delete</i></a>
                            <a href="assets_edit.php?id=' . $asset['id'] . '" class="btn-small orange"><i class="material-icons">edit</i></a>
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
