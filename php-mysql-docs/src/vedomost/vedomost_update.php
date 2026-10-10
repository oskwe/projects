<?php
include_once __DIR__ . '/../../db.php';

$vedomost_id = $_GET['id'] ?? null;
if (!$vedomost_id) {
    die("ID ордера не указан.");
}

$vedomost = fetchOne("SELECT * FROM vedomost WHERE id = ?", [$vedomost_id]);
if (!$vedomost) {
    die("Ордер не найден.");
}

$vedomost_bodies = executeQuery("SELECT * FROM vedomost_bodies WHERE vedomost_id = ?", [$vedomost_id]);
$organizations = executeQuery("SELECT id, name FROM organizations");

// Обработчик форм
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($_POST['action'] === 'update_header') {
        executeQuery("UPDATE vedomost SET
            document_number = ?, date = ?, operation_code = ?, warehouse = ?, supplier_name = ?, supplier_code = ?,
            insurance_company = ?, corresponding_account = ?, analytical_account_code = ?,
            supporting_document = ?, payment_document = ?, organization_id = ?, subdivision = ?, updated_at = NOW()
        WHERE id = ?", [
            $_POST['document_number'] ?? '',
            $_POST['date'] ?? '',
            $_POST['operation_code'] ?? '',
            $_POST['warehouse'] ?? '',
            $_POST['supplier_name'] ?? '',
            $_POST['supplier_code'] ?? '',
            $_POST['insurance_company'] ?? '',
            $_POST['corresponding_account'] ?? '',
            $_POST['analytical_account_code'] ?? '',
            $_POST['supporting_document'] ?? '',
            $_POST['payment_document'] ?? '',
            $_POST['organization_id'] ?? null,
            $_POST['subdivision'] ?? '',
            $vedomost_id
        ]);
        header("Location: vedomost_update.php?id=$vedomost_id");
        exit;
    }

    if ($_POST['action'] === 'add_item') {
        executeQuery("INSERT INTO vedomost_bodies (
            vedomost_id, material_name, nomenclature_number, unit_code, unit_name,
            quantity_by_doc, quantity_accepted, price, sum_without_vat, vat_amount, sum_with_vat,
            passport_number, stock_card_number, note, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())", [
            $vedomost_id,
            $_POST['material_name'] ?? '',
            $_POST['nomenclature_number'] ?? '',
            $_POST['unit_code'] ?? '',
            $_POST['unit_name'] ?? '',
            $_POST['quantity_by_doc'] ?? 0,
            $_POST['quantity_accepted'] ?? 0,
            $_POST['price'] ?? 0,
            $_POST['sum_without_vat'] ?? 0,
            $_POST['vat_amount'] ?? 0,
            $_POST['sum_with_vat'] ?? 0,
            $_POST['passport_number'] ?? '',
            $_POST['stock_card_number'] ?? '',
            $_POST['note'] ?? ''
        ]);
        header("Location: vedomost_update.php?id=$vedomost_id");
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактировать ордер <?= htmlspecialchars($vedomost['document_number'] ?? '') ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
                    <li><a href="../assets/assets_view.php">Основные средства</a></li>
                </ul>
            </div>
        </nav>
    </div>
    <ul id="sidenav-left" class="sidenav sidenav-fixed">
        <li><a class="subheader">Документы</a></li>
        <li class="bold"><a href="../proxy/proxy_view.php" class="waves-effect">Доверенности</a></li>
        <li class="bold"><a href="vedomost_view.php" class="waves-effect">Приходные ордера на склад</a></li>
    </ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text">Редактировать приходный ордер</h5>
        <form method="post">
            <input type="hidden" name="action" value="update_header">
            <!-- заголовок документа -->
            <!-- ... -->
        </form>

        <h6 class="blue-text text-darken-2" style="margin-top:2rem;">Добавить позицию</h6>
        <form method="post">
            <input type="hidden" name="action" value="add_item">
            <div class="row">
                <div class="input-field col s6">
                    <input type="text" name="material_name" required value="<?= htmlspecialchars($vedomost['material_name'] ?? '') ?>">
                    <label class="active">Материал</label>
                </div>
                <div class="input-field col s6">
                    <input type="text" name="nomenclature_number" value="<?= htmlspecialchars($vedomost['nomenclature_number'] ?? '') ?>">
                    <label class="active">Номенклатурный номер</label>
                </div>
            </div>
            <div class="row">
                <div class="input-field col s3">
                    <input type="text" name="unit_code" value="<?= htmlspecialchars($vedomost['unit_code'] ?? '') ?>">
                    <label class="active">Код ед.</label>
                </div>
                <div class="input-field col s3">
                    <input type="text" name="unit_name" value="<?= htmlspecialchars($vedomost['unit_name'] ?? '') ?>">
                    <label class="active">Ед. измерения</label>
                </div>
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="quantity_by_doc" value="<?= htmlspecialchars($vedomost['quantity_by_doc'] ?? '') ?>">
                    <label class="active">Кол-во (док)</label>
                </div>
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="quantity_accepted" value="<?= htmlspecialchars($vedomost['quantity_accepted'] ?? '') ?>">
                    <label class="active">Кол-во (принято)</label>
                </div>
            </div>
            <div class="row">
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="price" value="<?= htmlspecialchars($vedomost['price'] ?? '') ?>">
                    <label class="active">Цена</label>
                </div>
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="sum_without_vat" value="<?= htmlspecialchars($vedomost['sum_without_vat'] ?? '') ?>">
                    <label class="active">Сумма без НДС</label>
                </div>
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="vat_amount" value="<?= htmlspecialchars($vedomost['vat_amount'] ?? '') ?>">
                    <label class="active">НДС</label>
                </div>
                <div class="input-field col s3">
                    <input type="number" step="0.01" name="sum_with_vat" value="<?= htmlspecialchars($vedomost['sum_with_vat'] ?? '') ?>">
                    <label class="active">Итого с НДС</label>
                </div>
            </div>
            <div class="row">
                <div class="input-field col s6">
                    <input type="text" name="passport_number" value="<?= htmlspecialchars($vedomost['passport_number'] ?? '') ?>">
                    <label class="active">Паспорт</label**>
                </div>
                <div class="input-field col s6">
                    <input type="text" name="stock_card_number" value="<?= htmlspecialchars($vedomost['stock_card_number'] ?? '') ?>">
                    <label class="active">Склад. картотека</label>
                </div>
            </div>
            <div class="input-field">
                <input type="text" name="note" value="<?= htmlspecialchars($vedomost['note'] ?? '') ?>">
                <label class="active">Примечание</label>
            </div>
            <button type="submit" class="btn green">Добавить</button>
        </form>

        <h6 class="blue-text text-darken-2" style="margin-top:2rem;">Содержимое ордера</h6>
        <table class="highlight">
            <thead>
                <tr>
                    <th>Материал</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Итого</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($vedomost_bodies as $item): ?>
                <tr>
                    <td><?= htmlspecialchars($item['material_name'] ?? '') ?></td>
                    <td><?= htmlspecialchars($item['quantity_accepted'] ?? '') ?></td>
                    <td><?= htmlspecialchars($item['price'] ?? '') ?></td>
                    <td><?= htmlspecialchars($item['sum_with_vat'] ?? '') ?></td>
                </tr>
                <?php endforeach; ?>
                <?php if (empty($vedomost_bodies)): ?>
                <tr><td colspan="4">Нет позиций</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        M.FormSelect.init(document.querySelectorAll('select'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    });
</script>
</body>
</html>
