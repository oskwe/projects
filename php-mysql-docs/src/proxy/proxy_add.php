<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Добавить доверенность</title>
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
        <h5 class="blue-text text-darken-2">Добавить доверенность</h5>

<form action="proxy_add.php" method="post">
    <?php
    include_once __DIR__ . '/../../db.php';

    $organizations = executeQuery("SELECT id, name FROM organizations");
    $customers = executeQuery("SELECT id, name FROM customers");
    $employees = executeQuery("SELECT id, last_name, first_name, middle_name FROM employees");

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $org_id = $_POST['organization_id'];
        $cust_id = $_POST['customer_id'];
        $emp_id = $_POST['employee_id'];
        $date_issue = $_POST['date_of_issue'];
        $date_valid = $_POST['is_valid_until'];

        executeQuery("INSERT INTO proxies (organization_id, customer_id, employee_id, date_of_issue, is_valid_until)
                      VALUES (?, ?, ?, ?, ?)", [$org_id, $cust_id, $emp_id, $date_issue, $date_valid]);

        echo '<p class="green-text">Доверенность успешно добавлена!</p>';
    }
    ?>

    <div class="row">
        <!-- Левая колонка: списки -->
        <div class="col s12 m6">
            <div class="input-field">
                <select name="organization_id" required>
                    <option value="" disabled selected>Выберите организацию</option>
                    <?php foreach ($organizations as $org): ?>
                        <option value="<?= htmlspecialchars($org['id']) ?>"><?= htmlspecialchars($org['name']) ?></option>
                    <?php endforeach; ?>
                </select>
                <label>Организация</label>
            </div>

            <div class="input-field">
                <select name="customer_id" required>
                    <option value="" disabled selected>Выберите клиента</option>
                    <?php foreach ($customers as $cust): ?>
                        <option value="<?= htmlspecialchars($cust['id']) ?>"><?= htmlspecialchars($cust['name']) ?></option>
                    <?php endforeach; ?>
                </select>
                <label>Клиент</label>
            </div>

            <div class="input-field">
                <select name="employee_id" required>
                    <option value="" disabled selected>Выберите сотрудника</option>
                    <?php foreach ($employees as $emp): ?>
                        <option value="<?= htmlspecialchars($emp['id']) ?>">
                            <?= htmlspecialchars("{$emp['last_name']} {$emp['first_name']} {$emp['middle_name']}") ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <label>Получение от</label>
            </div>
        </div>

        <!-- Правая колонка: даты -->
        <div class="col s12 m6">
            <div class="input-field">
                <input type="date" name="date_of_issue" required value="<?= date('Y-m-d') ?>">
                <label class="active">Дата выдачи</label>
            </div>

            <div class="input-field">
                <input type="date" name="is_valid_until" required value="<?= date('Y-m-d') ?>">
                <label class="active">Действительна до</label>
            </div>
        </div>
    </div>

    <button type="submit" class="btn blue darken-1"><a href="proxy_.php" class="btn-flat">Добавить</a></button>
    <a href="proxy_view.php" class="btn-flat">Назад</a>
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
