<?php
require_once __DIR__ . '/../../db.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die('Некорректный ID доверенности');
}

$proxyId = (int)$_GET['id'];

$proxyData = executeQuery("
    SELECT
        p.id,
        o.name AS organization_name,
        o.address AS organization_address,
        a.account AS account,
        a.bank_name,
        a.bank_identity_number,
        p.date_of_issue,
        p.is_valid_until,
        CONCAT(e.last_name, ' ', e.first_name, ' ', e.middle_name) AS employee_name,
        e.passport_series,
        e.passport_number,
        e.passport_issued_by,
        e.passport_date_of_issue,
        c.name AS customer_name,
        o.chief,
        o.financial_chief
    FROM proxies p
    JOIN organizations o ON p.organization_id = o.id
    LEFT JOIN accounts a ON o.account_id = a.id
    JOIN customers c ON p.customer_id = c.id
    JOIN employees e ON p.employee_id = e.id
    WHERE p.id = :id
", ['id' => $proxyId]);

if (!$proxyData) {
    die('Доверенность не найдена');
}

$proxy = $proxyData[0];

$proxy_items = executeQuery("
    SELECT pb.product_id, pr.name, pr.price, pb.product_amount
    FROM proxy_bodies pb
    JOIN products pr ON pb.product_id = pr.id
    WHERE pb.proxy_id = :id
", ['id' => $proxyId]);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Доверенность №<?= $proxy['id'] ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="styles.css" rel="stylesheet">
    <link href="print.css" rel="stylesheet">
    <style>
        @media print {
            body * {
                visibility: hidden;
            }
            #print-area, #print-area * {
                visibility: visible;
            }
            #print-area {
                position: absolute;
                left: 0;
                top: 0;
            }
            .not-print {
                display: none !important;
            }
        }

        table td {
            padding: 8px;
        }

        .signature-line {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
    </style>
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
    <div class="container" id="print-area">
        <div class="row valign-wrapper">
            <div class="col s12 m6">
                <h5 class="blue-text text-darken-2">Доверенность №<?= $proxy['id'] ?></h5>
            </div>
            <div class="col s12 m6 right-align not-print">
                <button class="btn waves-effect waves-light green not-print" onclick="printElementById('print-area')">
                    <i class="material-icons left">print</i>Печать
                </button>
            </div>
        </div>

        <table class="highlight striped">
            <tbody>
                <tr><td><strong>Организация:</strong></td><td><?= $proxy['organization_name'] ?>, <?= $proxy['organization_address'] ?></td></tr>
                <tr><td><strong>Счет №:</strong></td><td>р/с <?= $proxy['account'] ?> в банке <?= $proxy['bank_name'] ?>, БИК <?= $proxy['bank_identity_number'] ?></td></tr>
                <tr><td><strong>Дата выдачи:</strong></td><td><?= $proxy['date_of_issue'] ?></td></tr>
                <tr><td><strong>Действительна по:</strong></td><td><?= $proxy['is_valid_until'] ?></td></tr>
                <tr><td><strong>Выдана:</strong></td><td><?= $proxy['employee_name'] ?></td></tr>
                <tr><td><strong>Паспорт:</strong></td><td>Серия <?= $proxy['passport_series'] ?>, номер <?= $proxy['passport_number'] ?>, <?= $proxy['passport_issued_by'] ?>, <?= $proxy['passport_date_of_issue'] ?></td></tr>
                <tr><td><strong>Получение от:</strong></td><td><?= $proxy['customer_name'] ?></td></tr>
            </tbody>
        </table>

        <h6 class="blue-text text-darken-2" style="margin-top: 40px;">Товары</h6>
        <table class="highlight striped">
            <thead>
                <tr>
                    <th>Код товара</th>
                    <th>Наименование</th>
                    <th>Цена за ед.</th>
                    <th>Количество</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($proxy_items as $item): ?>
                    <tr>
                        <td><?= $item['product_id'] ?></td>
                        <td><?= $item['name'] ?></td>
                        <td><?= $item['price'] ?></td>
                        <td><?= $item['product_amount'] ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="signature-line">
            <div><b>Генеральный директор:</b> <?= $proxy['chief'] ?></div>
            <div><b>Главный бухгалтер:</b> <?= $proxy['financial_chief'] ?></div>
        </div>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
function printElementById(id) {
    const content = document.getElementById(id);
    if (!content) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
        <html>
        <head>
            <title>Печать</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
            <style>
                body { font-family: sans-serif; padding: 20px; color: #000; background: #fff; }
                table { width: 100%; border-collapse: collapse; }
                td, th { padding: 8px; border: 1px solid #ccc; }
                .signature-line {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                @media print {
                    .no-print, .not-print { display: none !important; }
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            ${content.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
}
</script>

</body>
</html>
