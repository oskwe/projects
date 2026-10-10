<?php
include_once __DIR__ . '/../../db.php';

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID не указан.");
}

$vedomost = fetchOne("SELECT * FROM vedomost WHERE id = ?", [$id]);
if (!$vedomost) {
    die("Авансовый отчет не найден.");
}

// Получаем позиции отчета
$items = executeQuery("SELECT * FROM vedomost_items WHERE vedomost_id = ?", [$id]);

$organizations = executeQuery("SELECT id, name FROM organizations");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Рассчитываем сальдо
    $advance_sum = (float)($_POST['advance_sum'] ?? 0);
    $spent_sum = (float)($_POST['spent_sum'] ?? 0);
    $balance_sum = $spent_sum - $advance_sum;
    
    $is_returned = isset($_POST['is_returned']) ? 1 : 0;
    $is_additional = isset($_POST['is_additional']) ? 1 : 0;
    
    executeQuery("UPDATE vedomost SET 
        document_number = ?, date = ?, organization_id = ?, employee_name = ?, 
        employee_position = ?, employee_department = ?, purpose = ?, 
        advance_sum = ?, spent_sum = ?, balance_sum = ?, return_date = ?,
        accountant_name = ?, cashier_name = ?, chief_name = ?, 
        is_returned = ?, is_additional = ?, comments = ?, updated_at = NOW()
        WHERE id = ?", [
        $_POST['document_number'],
        $_POST['date'],
        $_POST['organization_id'],
        $_POST['employee_name'],
        $_POST['employee_position'],
        $_POST['employee_department'],
        $_POST['purpose'],
        $advance_sum,
        $spent_sum,
        $balance_sum,
        $_POST['return_date'] ?? null,
        $_POST['accountant_name'],
        $_POST['cashier_name'],
        $_POST['chief_name'],
        $is_returned,
        $is_additional,
        $_POST['comments'],
        $id
    ]);
    
    // Удаляем старые позиции
    executeQuery("DELETE FROM vedomost_items WHERE vedomost_id = ?", [$id]);
    
    // Добавляем новые позиции
    if (isset($_POST['item_document_number'])) {
        $pdo = getPDO();
        for ($i = 0; $i < count($_POST['item_document_number']); $i++) {
            if (empty($_POST['item_document_number'][$i])) continue;
            
            $item_stmt = $pdo->prepare("INSERT INTO vedomost_items (
                vedomost_id, document_number, document_date, expense_type, document_name, sum, account_code, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $item_stmt->execute([
                $id,
                $_POST['item_document_number'][$i],
                $_POST['item_document_date'][$i] ?? null,
                $_POST['item_expense_type'][$i] ?? null,
                $_POST['item_document_name'][$i] ?? null,
                (float)($_POST['item_sum'][$i] ?? 0),
                $_POST['item_account_code'][$i] ?? null,
                $_POST['item_notes'][$i] ?? null
            ]);
        }
    }
    
    header("Location: vedomost_view.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Редактировать авансовый отчет</title>
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
        <h5 class="blue-text">Редактировать авансовый отчет</h5>
        <form method="POST" id="advanceForm">
            <!-- Основные данные -->
            <div class="card-panel grey lighten-5">
                <h6 class="blue-text">Основные данные</h6>
                <div class="row">
                    <div class="input-field col s4">
                        <input type="text" name="document_number" required value="<?= htmlspecialchars($vedomost['document_number'] ?? '') ?>">
                        <label class="active">Номер авансового отчета</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="date" name="date" required value="<?= htmlspecialchars($vedomost['date'] ?? '') ?>">
                        <label class="active">Дата составления</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="date" name="return_date" value="<?= htmlspecialchars($vedomost['return_date'] ?? '') ?>">
                        <label class="active">Срок представления</label>
                    </div>
                </div>

                <div class="input-field">
                    <select name="organization_id" required>
                        <option value="" disabled>Выберите организацию</option>
                        <?php foreach ($organizations as $org): ?>
                            <option value="<?= $org['id'] ?>" <?= $org['id']==($vedomost['organization_id']??'')?'selected':''?>>
                                <?= htmlspecialchars($org['name']) ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                    <label>Организация</label>
                </div>
            </div>

            <!-- Сведения о сотруднике -->
            <div class="card-panel grey lighten-5">
                <h6 class="blue-text">Сведения о сотруднике</h6>
                <div class="row">
                    <div class="input-field col s6">
                        <input type="text" name="employee_name" required value="<?= htmlspecialchars($vedomost['employee_name'] ?? '') ?>">
                        <label class="active">ФИО сотрудника</label>
                    </div>
                    <div class="input-field col s6">
                        <input type="text" name="employee_position" required value="<?= htmlspecialchars($vedomost['employee_position'] ?? '') ?>">
                        <label class="active">Должность</label>
                    </div>
                </div>
                <div class="row">
                    <div class="input-field col s12">
                        <input type="text" name="employee_department" value="<?= htmlspecialchars($vedomost['employee_department'] ?? '') ?>">
                        <label class="active">Подразделение/отдел</label>
                    </div>
                </div>
                <div class="row">
                    <div class="input-field col s12">
                        <input type="text" name="purpose" required value="<?= htmlspecialchars($vedomost['purpose'] ?? '') ?>">
                        <label class="active">Цель расхода</label>
                    </div>
                </div>
            </div>

            <!-- Суммы -->
            <div class="card-panel grey lighten-5">
                <h6 class="blue-text">Финансовые данные</h6>
                <div class="row">
                    <div class="input-field col s4">
                        <input type="number" step="0.01" name="advance_sum" required value="<?= htmlspecialchars($vedomost['advance_sum'] ?? 0) ?>" onchange="calculateBalance()">
                        <label class="active">Выдано авансом, руб.</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="number" step="0.01" name="spent_sum" required value="<?= htmlspecialchars($vedomost['spent_sum'] ?? 0) ?>" onchange="calculateBalance()">
                        <label class="active">Израсходовано, руб.</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="text" id="balance_display" readonly class="grey-text" value="<?php 
                            $balance = ($vedomost['spent_sum'] ?? 0) - ($vedomost['advance_sum'] ?? 0);
                            $text = '';
                            if ($balance < 0) {
                                $text = 'К возврату: ' . number_format(abs($balance), 2, ',', ' ') . ' руб.';
                            } elseif ($balance > 0) {
                                $text = 'К доплате: ' . number_format($balance, 2, ',', ' ') . ' руб.';
                            } else {
                                $text = 'Сдано полностью';
                            }
                            echo htmlspecialchars($text);
                        ?>">
                        <label class="active">Сальдо</label>
                    </div>
                </div>
                <div class="row">
                    <div class="col s6">
                        <label>
                            <input type="checkbox" name="is_returned" value="1" <?= $vedomost['is_returned'] ? 'checked' : '' ?> />
                            <span>Возвращено в кассу</span>
                        </label>
                    </div>
                    <div class="col s6">
                        <label>
                            <input type="checkbox" name="is_additional" value="1" <?= $vedomost['is_additional'] ? 'checked' : '' ?> />
                            <span>Доплата из кассы</span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Оправдательные документы -->
            <div class="card-panel grey lighten-5">
                <h6 class="blue-text">Оправдательные документы</h6>
                <div id="items-container">
                    <?php foreach ($items as $item): ?>
                    <div class="item-row row">
                        <div class="input-field col s2">
                            <input type="text" name="item_document_number[]" value="<?= htmlspecialchars($item['document_number'] ?? '') ?>">
                            <label class="active">№ док.</label>
                        </div>
                        <div class="input-field col s2">
                            <input type="date" name="item_document_date[]" value="<?= htmlspecialchars($item['document_date'] ?? '') ?>">
                            <label class="active">Дата</label>
                        </div>
                        <div class="input-field col s2">
                            <input type="text" name="item_expense_type[]" value="<?= htmlspecialchars($item['expense_type'] ?? '') ?>">
                            <label class="active">Вид расхода</label>
                        </div>
                        <div class="input-field col s3">
                            <input type="text" name="item_document_name[]" value="<?= htmlspecialchars($item['document_name'] ?? '') ?>">
                            <label class="active">Наименование</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="number" step="0.01" name="item_sum[]" value="<?= htmlspecialchars($item['sum'] ?? 0) ?>" onchange="calculateTotal()">
                            <label class="active">Сумма</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="text" name="item_account_code[]" value="<?= htmlspecialchars($item['account_code'] ?? '') ?>">
                            <label class="active">Счет</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="text" name="item_notes[]" value="<?= htmlspecialchars($item['notes'] ?? '') ?>">
                            <label class="active">Прим.</label>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <?php if (empty($items)): ?>
                    <div class="item-row row">
                        <div class="input-field col s2">
                            <input type="text" name="item_document_number[]">
                            <label>№ док.</label>
                        </div>
                        <div class="input-field col s2">
                            <input type="date" name="item_document_date[]">
                            <label>Дата</label>
                        </div>
                        <div class="input-field col s2">
                            <input type="text" name="item_expense_type[]">
                            <label>Вид расхода</label>
                        </div>
                        <div class="input-field col s3">
                            <input type="text" name="item_document_name[]">
                            <label>Наименование</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="number" step="0.01" name="item_sum[]" value="0" onchange="calculateTotal()">
                            <label>Сумма</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="text" name="item_account_code[]">
                            <label>Счет</label>
                        </div>
                        <div class="input-field col s1">
                            <input type="text" name="item_notes[]">
                            <label>Прим.</label>
                        </div>
                    </div>
                    <?php endif; ?>
                </div>
                <div class="row">
                    <div class="col s12">
                        <button type="button" class="btn-small blue" onclick="addItemRow()">
                            <i class="material-icons left">add</i>Добавить строку
                        </button>
                    </div>
                </div>
                <div class="row">
                    <div class="col s12 right-align">
                        <h6>Итого по документам: <span id="items-total"><?= number_format($vedomost['spent_sum'] ?? 0, 2, ',', ' ') ?></span> руб.</h6>
                    </div>
                </div>
            </div>

            <!-- Подписи -->
            <div class="card-panel grey lighten-5">
                <h6 class="blue-text">Подписи</h6>
                <div class="row">
                    <div class="input-field col s4">
                        <input type="text" name="accountant_name" value="<?= htmlspecialchars($vedomost['accountant_name'] ?? '') ?>">
                        <label class="active">Бухгалтер</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="text" name="cashier_name" value="<?= htmlspecialchars($vedomost['cashier_name'] ?? '') ?>">
                        <label class="active">Кассир</label>
                    </div>
                    <div class="input-field col s4">
                        <input type="text" name="chief_name" value="<?= htmlspecialchars($vedomost['chief_name'] ?? '') ?>">
                        <label class="active">Руководитель</label>
                    </div>
                </div>
                <div class="row">
                    <div class="input-field col s12">
                        <textarea name="comments" class="materialize-textarea"><?= htmlspecialchars($vedomost['comments'] ?? '') ?></textarea>
                        <label class="active">Примечания</label>
                    </div>
                </div>
            </div>

            <button type="submit" class="btn blue">Сохранить</button>
            <a href="vedomost_view.php" class="btn grey">Отмена</a>
        </form>
    </div>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        M.FormSelect.init(document.querySelectorAll('select'));
        M.Sidenav.init(document.querySelectorAll('.sidenav'));
        M.textareaAutoResize(document.querySelector('textarea'));
        calculateBalance();
        calculateTotal();
    });

    function calculateBalance() {
        const advance = parseFloat(document.querySelector('input[name="advance_sum"]').value) || 0;
        const spent = parseFloat(document.querySelector('input[name="spent_sum"]').value) || 0;
        const balance = spent - advance;
        
        let text = '';
        let color = '';
        
        if (balance < 0) {
            text = `К возврату: ${Math.abs(balance).toFixed(2)} руб.`;
            color = 'green-text';
        } else if (balance > 0) {
            text = `К доплате: ${balance.toFixed(2)} руб.`;
            color = 'red-text';
        } else {
            text = 'Сдано полностью';
            color = 'blue-text';
        }
        
        const balanceDisplay = document.getElementById('balance_display');
        balanceDisplay.value = text;
        balanceDisplay.className = `grey-text ${color}`;
    }

    function calculateTotal() {
        let total = 0;
        document.querySelectorAll('input[name="item_sum[]"]').forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        document.getElementById('items-total').textContent = total.toFixed(2);
        document.querySelector('input[name="spent_sum"]').value = total.toFixed(2);
        calculateBalance();
    }

    function addItemRow() {
        const container = document.getElementById('items-container');
        const newRow = container.firstElementChild.cloneNode(true);
        
        // Очищаем значения
        newRow.querySelectorAll('input').forEach(input => {
            input.value = '';
            if (input.name === 'item_sum[]') {
                input.value = '0';
            }
        });
        
        container.appendChild(newRow);
        
        // Переинициализация Materialize
        M.updateTextFields();
    }
</script>
</body>
</html>