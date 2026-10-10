<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID доверенности не указан.");
}

$proxy = fetchOne("SELECT * FROM proxies WHERE id = ?", [$id]);
if (!$proxy) {
    die("Доверенность не найдена.");
}

$proxy_bodies = executeQuery("SELECT * FROM proxy_bodies WHERE proxy_id = ?", [$id]);

$organizations = executeQuery("SELECT id, name FROM organizations");
$customers = executeQuery("SELECT id, name FROM customers");
$employees = executeQuery("SELECT id, last_name, first_name, middle_name FROM employees");
$products = executeQuery("SELECT id, name, price FROM products");
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактировать доверенность #<?= htmlspecialchars($id) ?></title>
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
                    <li><a href="#">Товары</a></li>
                    <li><a href="#">Сотрудники</a></li>
                    <li><a href="#">Контрагенты</a></li>
                    <li><a href="#">Организации</a></li>
                    <li><a href="#">Счета</a></li>
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
        <h5 class="blue-text text-darken-2">Редактировать доверенность #<?= htmlspecialchars($id) ?></h5>

        <form action="proxy_edit_handler.php" method="post">
            <input type="hidden" name="proxy_id" value="<?= htmlspecialchars($id) ?>">

            <div class="row">
                <div class="input-field col s6">
                    <select name="organization_id" required>
                        <option disabled>Выберите организацию</option>
                        <?php foreach ($organizations as $org): ?>
                            <option value="<?= $org['id'] ?>" <?= $org['id'] == $proxy['organization_id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($org['name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <label>Организация</label>
                </div>

                <div class="input-field col s6">
                    <select name="customer_id" required>
                        <option disabled>Выберите клиента</option>
                        <?php foreach ($customers as $cust): ?>
                            <option value="<?= $cust['id'] ?>" <?= $cust['id'] == $proxy['customer_id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars($cust['name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <label>Клиент</label>
                </div>

                <div class="input-field col s6">
                    <select name="employee_id" required>
                        <option disabled>Выберите сотрудника</option>
                        <?php foreach ($employees as $emp): ?>
                            <option value="<?= $emp['id'] ?>" <?= $emp['id'] == $proxy['employee_id'] ? 'selected' : '' ?>>
                                <?= htmlspecialchars("{$emp['last_name']} {$emp['first_name']} {$emp['middle_name']}") ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <label>Сотрудник</label>
                </div>

                <div class="input-field col s3">
                    <input type="date" name="date_of_issue" value="<?= htmlspecialchars($proxy['date_of_issue']) ?>" required>
                    <label class="active">Дата выдачи</label>
                </div>

                <div class="input-field col s3">
                    <input type="date" name="is_valid_until" value="<?= htmlspecialchars($proxy['is_valid_until']) ?>" required>
                    <label class="active">Действительна до</label>
                </div>
            </div>

            <h6 class="blue-text text-darken-2">Товары</h6>
            <a class="btn-small green" onclick="addProductRow()"><i class="material-icons left">add</i>Добавить товар</a>

            <table class="highlight striped" id="products-table" style="margin-top: 1rem;">
                <thead>
                    <tr>
                        <th>Код товара</th>
                        <th>Наименование</th>
                        <th>Цена за ед.</th>
                        <th>Количество</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($proxy_bodies as $body): ?>
                    <?php
                    // Найти продукт по id
                    $product = null;
                    foreach ($products as $p) {
                        if ($p['id'] == $body['product_id']) {
                            $product = $p;
                            break;
                        }
                    }
                    ?>
                    <tr>
                        <td>
                            <select name="product_id[]" required>
                                <option value="" disabled>Выберите</option>
                                <?php foreach ($products as $p): ?>
                                    <option value="<?= $p['id'] ?>" <?= $p['id'] == $body['product_id'] ? 'selected' : '' ?>>
                                        <?= $p['id'] ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                        <td class="product-name"><?= htmlspecialchars($product['name'] ?? '') ?></td>
                        <td class="product-price"><?= htmlspecialchars($product['price'] ?? '') ?></td>
                        <td><input type="number" name="product_amount[]" min="1" required value="<?= htmlspecialchars($body['product_amount']) ?>"></td>
                        <td><a href="#" onclick="this.closest('tr').remove()" class="btn-flat red-text">✕</a></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>

            <br>
            <button type="submit" class="btn blue darken-1">Сохранить изменения</button>
            <a href="proxy_view.php" class="btn-flat">Отмена</a>
        </form>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    M.FormSelect.init(document.querySelectorAll('select'));

    // Инициализируем сразу отображение имени и цены в существующих строках
    document.querySelectorAll('#products-table tbody tr').forEach(row => {
        const select = row.querySelector('select');
        select.dispatchEvent(new Event('change'));
        select.addEventListener('change', function () {
            const product = products.find(p => p.id == this.value);
            row.querySelector('.product-name').textContent = product ? product.name : '';
            row.querySelector('.product-price').textContent = product ? product.price : '';
        });
    });
});

const products = <?= json_encode($products) ?>;

function addProductRow() {
    const tbody = document.querySelector("#products-table tbody");
    const row = document.createElement("tr");

    const options = products.map(p => `<option value="${p.id}">${p.id}</option>`).join('');

    row.innerHTML = `
        <td>
            <select name="product_id[]" required>
                <option value="" disabled selected>Выберите</option>
                ${options}
            </select>
        </td>
        <td class="product-name"></td>
        <td class="product-price"></td>
        <td><input type="number" name="product_amount[]" min="1" required></td>
        <td><a href="#" onclick="this.closest('tr').remove()" class="btn-flat red-text">✕</a></td>
    `;

    tbody.appendChild(row);
    M.FormSelect.init(row.querySelectorAll('select'));

    const select = row.querySelector('select');
    select.addEventListener('change', function () {
        const product = products.find(p => p.id == this.value);
        row.querySelector('.product-name').textContent = product ? product.name : '';
        row.querySelector('.product-price').textContent = product ? product.price : '';
    });
}
</script>

</body>
</html>
