<?php
include_once __DIR__ . '/../../db.php';

$reports = executeQuery("
    SELECT 
        v.id,
        v.document_number,
        v.date,
        v.employee_name,
        v.employee_position,
        v.employee_department,
        v.purpose,
        v.advance_sum,
        v.spent_sum,
        v.balance_sum,
        o.name AS organization_name
    FROM vedomost v
    LEFT JOIN organizations o ON v.organization_id = o.id
    ORDER BY v.date DESC
");
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Авансовые отчеты (форма АО-1)</title>
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
                <li><a href="../assets/assets_view.php">Основные средства</a></li>
            </ul>
        </div>
    </nav>
</div>

<ul id="sidenav-left" class="sidenav sidenav-fixed">
    <li><a class="subheader">Документы</a></li>
    <li class="bold"><a href="../proxy/proxy_view.php" class="waves-effect">Доверенности</a></li>
    <li class="bold"><a href="vedomost_view.php" class="waves-effect active">Авансовые отчеты (форма АО-1)</a></li>
</ul>
</header>

<main>
    <div class="container">
        <h5 class="blue-text text-darken-2">Авансовые отчеты (форма АО-1)</h5>
        <a href="vedomost_add.php" class="btn-flat blue-text text-darken-2">
            <i class="material-icons left">add</i>ДОБАВИТЬ
        </a>

        <table class="highlight striped">
            <thead>
                <tr>
                    <th>№ отчета</th>
                    <th>Дата</th>
                    <th>Организация</th>
                    <th>Сотрудник</th>
                    <th>Должность</th>
                    <th>Цель</th>
                    <th>Аванс</th>
                    <th>Расход</th>
                    <th>Сальдо</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($reports as $report): 
                    $balance = $report['balance_sum'];
                    $balance_class = $balance < 0 ? 'green-text' : ($balance > 0 ? 'red-text' : '');
                    $balance_text = $balance < 0 ? 'к возврату' : ($balance > 0 ? 'к доплате' : 'сдано');
                ?>
                    <tr>
                        <td><?= htmlspecialchars($report['document_number'] ?? '') ?></td>
                        <td><?= htmlspecialchars($report['date'] ?? '') ?></td>
                        <td><?= htmlspecialchars($report['organization_name'] ?? '') ?></td>
                        <td><?= htmlspecialchars($report['employee_name'] ?? '') ?></td>
                        <td><?= htmlspecialchars($report['employee_position'] ?? '') ?></td>
                        <td><?= htmlspecialchars($report['purpose'] ?? '') ?></td>
                        <td><?= number_format($report['advance_sum'] ?? 0, 2, ',', ' ') ?> ₽</td>
                        <td><?= number_format($report['spent_sum'] ?? 0, 2, ',', ' ') ?> ₽</td>
                        <td class="<?= $balance_class ?>">
                            <strong><?= number_format(abs($balance), 2, ',', ' ') ?> ₽</strong><br>
                            <small><?= $balance_text ?></small>
                        </td>
                        <td>
                            <a href="vedomost_delete.php?id=<?= $report['id'] ?>" class="btn-small red" onclick="return confirm('Удалить авансовый отчет?')">
                                <i class="material-icons">delete</i>
                            </a>
                            <a href="vedomost_edit.php?id=<?= $report['id'] ?>" class="btn-small orange">
                                <i class="material-icons">edit</i>
                            </a>
                            <a href="vedomost_print.php?id=<?= $report['id'] ?>" class="btn-small blue" target="_blank">
                                <i class="material-icons">print</i>
                            </a>
                            <!-- <a href="vedomost_details.php?id=<?= $report['id'] ?>" class="btn-small green">
                                <i class="material-icons">list</i>
                            </a> -->
                        </td>
                    </tr>
                <?php endforeach; ?>
                <?php if (empty($reports)): ?>
                    <tr><td colspan="10" class="center-align">Нет данных</td></tr>
                <?php endif; ?>
            </tbody>
        </table>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function () {
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
    });
</script>
</body>
</html> 