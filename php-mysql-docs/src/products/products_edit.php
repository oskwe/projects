<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) die('ID не указан');

$product = executeQuery("SELECT * FROM products WHERE id = ?", [$id])[0] ?? null;
if (!$product) die('Товар не найден');

$units = executeQuery("SELECT id, name FROM units ORDER BY name");
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактирование товара</title>
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
        <h5 class="blue-text text-darken-2">Редактировать товар</h5>
        <form action="products_edit_handler.php" method="POST">
            <input type="hidden" name="id" value="<?= htmlspecialchars($product['id']) ?>">
            <div class="row">
                <div class="input-field col s12 m6">
                    <input id="name" name="name" type="text" value="<?= htmlspecialchars($product['name']) ?>" required>
                    <label for="name" class="active">Наименование продукта</label>
                </div>
                <div class="input-field col s12 m6">
                    <input id="price" name="price" type="number" step="0.01" value="<?= htmlspecialchars($product['price']) ?>" required>
                    <label for="price" class="active">Цена</label>
                </div>
                <div class="input-field col s12 m6">
                    <select id="unit_id" name="unit_id" required>
                        <option value="" disabled>Выберите единицу измерения</option>
                        <?php
                        foreach ($units as $unit) {
                            $selected = ($unit['id'] == $product['unit_id']) ? 'selected' : '';
                            echo '<option value="' . $unit['id'] . '" ' . $selected . '>' . htmlspecialchars($unit['name']) . '</option>';
                        }
                        ?>
                    </select>
                    <label for="unit_id">Единицы измерения</label>
                </div>
            </div>
            <button type="submit" class="btn blue">
                <i class="material-icons left">check</i>СОХРАНИТЬ
            </button>
            <a href="products_view.php" class="btn-flat">ОТМЕНА</a>
        </form>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});
</script>

</body>
</html>
