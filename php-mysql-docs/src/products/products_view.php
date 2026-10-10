<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Товары — Просмотр</title>
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
                <li><a href="../assets/assets_view.php">Основные средства</a></li>
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
        <h5 class="blue-text text-darken-2">Товары</h5>
        <a href="products_add.php" class="btn-flat blue-text text-darken-2"><i class="material-icons left">add</i>ДОБАВИТЬ</a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>Наименование продукта</th>
                    <th>Цена</th>
                    <th>Единицы измерения</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php
                include_once __DIR__ . '/../../db.php';

                $products = executeQuery("
                    SELECT p.id, p.name, p.price, u.name AS unit_name
                    FROM products p
                    JOIN units u ON p.unit_id = u.id
                ");

                foreach ($products as $product) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($product['name']) . '</td>';
                    echo '<td>' . htmlspecialchars($product['price']) . '</td>';
                    echo '<td>' . htmlspecialchars($product['unit_name']) . '</td>';
                    echo '<td>
                            <a href="products_delete.php?id=' . $product['id'] . '" class="btn-small red" onclick="return confirm(\'Удалить товар?\')"><i class="material-icons">delete</i></a>
                            <a href="products_edit.php?id=' . $product['id'] . '" class="btn-small orange"><i class="material-icons">edit</i></a>
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
