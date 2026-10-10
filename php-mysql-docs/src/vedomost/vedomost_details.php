<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID не указан.");
}

$vedomost = fetchOne("SELECT v.*, o.name AS organization_name FROM vedomost v 
                     LEFT JOIN organizations o ON v.organization_id = o.id WHERE v.id = ?", [$id]);
if (!$vedomost) {
    die("Авансовый отчет не найден.");
}

$items = executeQuery("SELECT * FROM vedomost_items WHERE vedomost_id = ? ORDER BY document_date", [$id]);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Просмотр авансового отчета</title>
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
        <li class="bold"><a href="vedomost_view.php" class="waves-effect">Авансовые отчеты (форма АО-1)</a></li>
    </ul>
</header>

<main>
    <div class="container">
        <div class="row valign-wrapper">
            <div class="col s12 m6">
                <h5 class="blue-text text-darken-2">Авансовый отчет № <?= htmlspecialchars($vedomost['document_number'] ?? '') ?></h5>
                <div class="grey-text">от <?= htmlspecialchars($vedomost['date'] ?? '') ?></div>
            </div>
            <div class="col s12 m6 right-align">
                <a href="vedomost_edit.php?id=<?= $id ?>" class="btn orange">
                    <i class="material-icons left">edit</i>Редактировать
                </a>
                <a href="vedomost_print.php?id=<?= $id ?>" class="btn blue" target="_blank">
                    <i class="material-icons left">print</i>Печать
                </a>
                <a href="vedomost_view.php" class="btn grey">
                    <i class="material-icons left">arrow_back</i>Назад
                </a>
            </div>
        </div>

        <!-- Основная информация -->
        <div class="card">
            <div class="card-content">
                <div class="row">
                    <div class="col s6">
                        <p><strong>Организация:</strong> <?= htmlspecialchars($vedomost['organization_name'] ?? '') ?></p>
                        <p><strong>Сотрудник:</strong> <?= htmlspecialchars($vedomost['employee_name'] ?? '') ?></p>
                        <p><strong>Должность:</strong> <?= htmlspecialchars($vedomost['employee_position'] ?? '') ?></p>
                        <p><strong>Подразделение:</strong> <?= htmlspecialchars($vedomost['employee_department'] ?? '') ?></p>
                    </div>
                    <div class="col s6">
                        <p><strong>Цель расхода:</strong> <?= htmlspecialchars($vedomost['purpose'] ?? '') ?></p>
                        <p><strong>Срок представления:</strong> <?= htmlspecialchars($vedomost['return_date'] ?? '') ?></p>
                        <p><strong>Состояние:</strong> 
                            <?php if ($vedomost['balance_sum'] < 0): ?>
                                <span class="green-text">Возвращено в кассу</span>
                            <?php elseif ($vedomost['balance_sum'] > 0): ?>
                                <span class="red-text">Требуется доплата</span>
                            <?php else: ?>
                                <span class="blue-text">Сдано полностью</span>
                            <?php endif; ?>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Финансовые данные -->
        <div class="card">
            <div class="card-content">
                <h6 class="blue-text">Финансовые данные</h6>
                <div class="row">
                    <div class="col s4 center-align">
                        <h5 class="blue-text"><?= number_format($vedomost['advance_sum'] ?? 0, 2, ',', ' ') ?> ₽</h5>
                        <p>Выдано авансом</p>
                    </div>
                    <div class="col s4 center-align">
                        <h5 class="blue-text"><?= number_format($vedomost['spent_sum'] ?? 0, 2, ',', ' ') ?> ₽</h5>
                        <p>Израсходовано</p>
                    </div>
                    <div class="col s4 center-align">
                        <?php 
                        $balance = $vedomost['balance_sum'];
                        $balance_class = $balance < 0 ? 'green-text' : ($balance > 0 ? 'red-text' : 'blue-text');
                        $balance_text = $balance < 0 ? 'К возврату' : ($balance > 0 ? 'К доплате' : 'Сальдо');
                        ?>
                        <h5 class="<?= $balance_class ?>"><?= number_format(abs($balance), 2, ',', ' ') ?> ₽</h5>
                        <p><?= $balance_text ?></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Оправдательные документы -->
        <div class="card">
            <div class="card-content">
                <h6 class="blue-text">Оправдательные документы</h6>
                <?php if (!empty($items)): ?>
                    <table class="highlight striped">
                        <thead>
                            <tr>
                                <th>№ документа</th>
                                <th>Дата</th>
                                <th>Вид расхода</th>
                                <th>Наименование</th>
                                <th>Сумма</th>
                                <th>Счет</th>
                                <th>Примечание</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php $total = 0; ?>
                            <?php foreach ($items as $item): ?>
                                <tr>
                                    <td><?= htmlspecialchars($item['document_number'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($item['document_date'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($item['expense_type'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($item['document_name'] ?? '') ?></td>
                                    <td><?= number_format($item['sum'] ?? 0, 2, ',', ' ') ?> ₽</td>
                                    <td><?= htmlspecialchars($item['account_code'] ?? '') ?></td>
                                    <td><?= htmlspecialchars($item['notes'] ?? '') ?></td>
                                </tr>
                                <?php $total += $item['sum']; ?>
                            <?php endforeach; ?>
                            <tr class="total-row">
                                <td colspan="4" class="right-align"><strong>Итого:</strong></td>
                                <td><strong><?= number_format($total, 2, ',', ' ') ?> ₽</strong></td>
                                <td colspan="2"></td>
                            </tr>
                        </tbody>
                    </table>
                <?php else: ?>
                    <p class="grey-text">Нет оправдательных документов</p>
                <?php endif; ?>
            </div>
        </div>

        <!-- Подписи и примечания -->
        <div class="card">
            <div class="card-content">
                <h6 class="blue-text">Подписи</h6>
                <div class="row">
                    <div class="col s4">
                        <p><strong>Бухгалтер:</strong></p>
                        <p><?= htmlspecialchars($vedomost['accountant_name'] ?? '') ?></p>
                    </div>
                    <div class="col s4">
                        <p><strong>Кассир:</strong></p>
                        <p><?= htmlspecialchars($vedomost['cashier_name'] ?? '') ?></p>
                    </div>
                    <div class="col s4">
                        <p><strong>Руководитель:</strong></p>
                        <p><?= htmlspecialchars($vedomost['chief_name'] ?? '') ?></p>
                    </div>
                </div>
                
                <?php if (!empty($vedomost['comments'])): ?>
                    <h6 class="blue-text" style="margin-top: 20px;">Примечания</h6>
                    <p><?= nl2br(htmlspecialchars($vedomost['comments'] ?? '')) ?></p>
                <?php endif; ?>
            </div>
        </div>
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