<?php
require_once __DIR__ . '/../../db.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die('Некорректный ID авансового отчета');
}

$vedomostId = (int)$_GET['id'];

$vedomost = fetchOne("SELECT v.*, o.name AS organization_name, o.address AS organization_address 
                     FROM vedomost v LEFT JOIN organizations o ON v.organization_id = o.id 
                     WHERE v.id = ?", [$vedomostId]);
if (!$vedomost) {
    die('Авансовый отчет не найден');
}

$items = executeQuery("SELECT * FROM vedomost_items WHERE vedomost_id = ? ORDER BY document_date", [$vedomostId]);

$balance = $vedomost['balance_sum'];
$balance_text = $balance < 0 ? 'к возврату' : ($balance > 0 ? 'к доплате' : 'сдано');
$balance_abs = abs($balance);
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Печать авансового отчета № <?= htmlspecialchars((string)($vedomost['document_number'] ?? '')) ?></title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
    <link href="print.css" rel="stylesheet" media="print">
    <style>
        @media screen {
            .print-preview {
                max-width: 210mm;
                margin: 20px auto;
                padding: 20px;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
                border: 1px solid #ddd;
            }
            
            .advance-header {
                background: #e3f2fd;
                padding: 15px;
                border-left: 4px solid #2196f3;
                margin-bottom: 20px;
            }
        }
        
        .form-title {
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
        }
        
        .form-subtitle {
            text-align: center;
            font-style: italic;
            margin-bottom: 15px;
        }
        
        .section-title {
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #ddd;
        }
        
        .signature-line {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
        }
        
        .signature-box {
            width: 30%;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #000;
        }
        
        .financial-summary {
            background: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }
        
        .summary-item {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #e0e0e0;
        }
        
        @media print {
            .form-title {
                font-size: 12pt;
            }
            
            .signature-box {
                min-width: 150px;
            }
        }
    </style>
</head>
<body class="preview-mode">

<header>
    <div class="navbar-fixed not-print">
        <nav class="navbar blue"><div class="nav-wrapper"><ul class="left">
            <li><a href="../proxy/proxy_view.php">Документы</a></li>
            <li><a href="../products/products_view.php">Товары</a></li>
            <li><a href="../employees/employees_view.php">Сотрудники</a></li>
            <li><a href="../customers/customers_view.php">Контрагенты</a></li>
            <li><a href="../organizations/organizations_view.php">Организации</a></li>
            <li><a href="../accounts/accounts_view.php">Счета</a></li>
            <li><a href="../assets/assets_view.php">Основные средства</a></li>
        </ul></div></nav>
    </div>
    <ul id="sidenav-left" class="sidenav sidenav-fixed not-print">
        <li class="bold"><a href="../proxy/proxy_view.php" class="waves-effect">Доверенности</a></li>
        <li class="bold"><a href="vedomost_view.php" class="waves-effect">Авансовые отчеты (форма АО-1)</a></li>
    </ul>
</header>

<main>
    <div class="container print-preview">
        <!-- Кнопки управления -->
        <div class="row valign-wrapper not-print">
            <div class="col s12 m6">
                <div class="advance-header">
                    <h5 class="blue-text">Авансовый отчет № <?= htmlspecialchars((string)($vedomost['document_number'] ?? '')) ?></h5>
                    <div class="grey-text">от <?= htmlspecialchars((string)($vedomost['date'] ?? '')) ?></div>
                </div>
            </div>
            <div class="col s12 m6 right-align">
                <button class="btn waves-effect waves-light blue print-btn" onclick="window.print()">
                    <i class="material-icons left">print</i>Печать
                </button>
                <a href="vedomost_view.php" class="btn waves-effect waves-light grey">
                    <i class="material-icons left">arrow_back</i>Назад
                </a>
            </div>
        </div>

        <!-- Область печати -->
        <div id="print-area">
            <!-- Заголовок формы -->
            <div class="form-title">Унифицированная форма № АО-1</div>
            <div class="form-subtitle">Утверждена Постановлением Госкомстата России от 01.08.2001 № 55</div>
            
            <!-- Шапка документа -->
            <table style="width: 100%; margin-bottom: 20px;">
                <tr>
                    <td style="width: 30%;"><strong>Код формы по ОКУД</strong></td>
                    <td style="width: 70%;">0330005</td>
                </tr>
                <tr>
                    <td><strong>Организация:</strong></td>
                    <td><?= htmlspecialchars($vedomost['organization_name'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Адрес:</strong></td>
                    <td><?= htmlspecialchars($vedomost['organization_address'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Номер документа:</strong></td>
                    <td><?= htmlspecialchars($vedomost['document_number'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Дата составления:</strong></td>
                    <td><?= htmlspecialchars($vedomost['date'] ?? '') ?></td>
                </tr>
            </table>

            <!-- Сведения о сотруднике -->
            <div class="section-title">Сведения о сотруднике</div>
            <table style="width: 100%; margin-bottom: 20px;">
                <tr>
                    <td style="width: 30%;"><strong>ФИО сотрудника:</strong></td>
                    <td><?= htmlspecialchars($vedomost['employee_name'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Должность:</strong></td>
                    <td><?= htmlspecialchars($vedomost['employee_position'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Подразделение:</strong></td>
                    <td><?= htmlspecialchars($vedomost['employee_department'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Цель расхода:</strong></td>
                    <td><?= htmlspecialchars($vedomost['purpose'] ?? '') ?></td>
                </tr>
                <tr>
                    <td><strong>Срок представления:</strong></td>
                    <td><?= htmlspecialchars($vedomost['return_date'] ?? '') ?></td>
                </tr>
            </table>

            <!-- Финансовые данные -->
            <div class="section-title">Финансовые данные</div>
            <div class="financial-summary">
                <div class="summary-item">
                    <span>Выдано авансом:</span>
                    <span><?= number_format($vedomost['advance_sum'] ?? 0, 2, ',', ' ') ?> руб.</span>
                </div>
                <div class="summary-item">
                    <span>Израсходовано:</span>
                    <span><?= number_format($vedomost['spent_sum'] ?? 0, 2, ',', ' ') ?> руб.</span>
                </div>
                <div class="summary-item" style="font-weight: bold;">
                    <span>Сальдо (<?= $balance_text ?>):</span>
                    <span><?= number_format($balance_abs, 2, ',', ' ') ?> руб.</span>
                </div>
            </div>

            <!-- Оправдательные документы -->
            <div class="section-title">Оправдательные документы</div>
            <?php if (!empty($items)): ?>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f0f0f0;">
                            <th style="border: 1px solid #000; padding: 5px;">№ док.</th>
                            <th style="border: 1px solid #000; padding: 5px;">Дата</th>
                            <th style="border: 1px solid #000; padding: 5px;">Вид расхода</th>
                            <th style="border: 1px solid #000; padding: 5px;">Наименование документа</th>
                            <th style="border: 1px solid #000; padding: 5px;">Сумма, руб.</th>
                            <th style="border: 1px solid #000; padding: 5px;">Счет</th>
                            <th style="border: 1px solid #000; padding: 5px;">Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php $total = 0; ?>
                        <?php foreach ($items as $item): ?>
                            <tr>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['document_number'] ?? '') ?></td>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['document_date'] ?? '') ?></td>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['expense_type'] ?? '') ?></td>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['document_name'] ?? '') ?></td>
                                <td style="border: 1px solid #000; padding: 5px; text-align: right;"><?= number_format($item['sum'] ?? 0, 2, ',', ' ') ?></td>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['account_code'] ?? '') ?></td>
                                <td style="border: 1px solid #000; padding: 5px;"><?= htmlspecialchars($item['notes'] ?? '') ?></td>
                            </tr>
                            <?php $total += $item['sum']; ?>
                        <?php endforeach; ?>
                        <tr style="font-weight: bold; background: #e0e0e0;">
                            <td colspan="4" style="border: 1px solid #000; padding: 5px; text-align: right;">Итого:</td>
                            <td style="border: 1px solid #000; padding: 5px; text-align: right;"><?= number_format($total, 2, ',', ' ') ?></td>
                            <td colspan="2" style="border: 1px solid #000; padding: 5px;"></td>
                        </tr>
                    </tbody>
                </table>
            <?php else: ?>
                <p style="text-align: center; font-style: italic; color: #666;">Оправдательные документы отсутствуют</p>
            <?php endif; ?>

            <!-- Подписи -->
            <div class="signature-line">
                <div class="signature-box">
                    <div><strong>Бухгалтер:</strong></div>
                    <div><?= htmlspecialchars($vedomost['accountant_name'] ?? '') ?></div>
                    <div style="margin-top: 40px;">(подпись)</div>
                </div>
                <div class="signature-box">
                    <div><strong>Кассир:</strong></div>
                    <div><?= htmlspecialchars($vedomost['cashier_name'] ?? '') ?></div>
                    <div style="margin-top: 40px;">(подпись)</div>
                </div>
                <div class="signature-box">
                    <div><strong>Руководитель:</strong></div>
                    <div><?= htmlspecialchars($vedomost['chief_name'] ?? '') ?></div>
                    <div style="margin-top: 40px;">(подпись)</div>
                </div>
            </div>

            <!-- Подпись сотрудника -->
            <div class="signature-line" style="margin-top: 60px;">
                <div class="signature-box">
                    <div><strong>Сотрудник:</strong></div>
                    <div><?= htmlspecialchars($vedomost['employee_name'] ?? '') ?></div>
                    <div style="margin-top: 40px;">(подпись)</div>
                </div>
                <div class="signature-box">
                    <div><strong>Дата:</strong></div>
                    <div><?= htmlspecialchars($vedomost['date'] ?? '') ?></div>
                </div>
            </div>

            <?php if (!empty($vedomost['comments'])): ?>
                <div style="margin-top: 30px; padding: 10px; border: 1px solid #ddd;">
                    <strong>Примечания:</strong><br>
                    <?= nl2br(htmlspecialchars($vedomost['comments'] ?? '')) ?>
                </div>
            <?php endif; ?>
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