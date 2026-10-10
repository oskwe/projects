'use strict';

const $ = (id) => document.getElementById(id);

// Удаляет всё, кроме цифр
const digitsOnly = (s) => s.replace(/\D+/g, '');

// Форматирует номер карты: добавляет пробелы каждые 4 цифры
const formatCardNumber = (num) => {
    const digits = digitsOnly(num);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

// Алгоритм Луна (Luhn algorithm)
function luhnCheck(cardNumber) {
    const digits = digitsOnly(cardNumber);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Определение бренда карты
function detectBrand(cardNumber) {
    const num = digitsOnly(cardNumber);
    const first4 = num.slice(0, 4);
    const first2 = num.slice(0, 2);
    const first1 = num.slice(0, 1);
    const first3 = num.slice(0, 3);

    // МИР: начинается с 220
    if (first3 === '220') {
        return 'mir';
    }


    // Maestro: 50, 56-69
    if (['50', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69'].includes(first2)) {
        return 'maestro';
    }


    // MasterCard: 51-55 или 2221-2720
    const first2Num = parseInt(first2, 10);
    const first4Num = parseInt(first4, 10);
    if ((first2Num >= 51 && first2Num <= 55) || 
        (first4Num >= 2221 && first4Num <= 2720)) {
        return 'mc';
    }

    // Visa: начинается с 4
    if (first1 === '4') {
        return 'visa';
    }

    return null;
}

function clearHighlight() {
    const cards = document.querySelectorAll('#cards img');
    cards.forEach(img => img.classList.remove('hl'));
}

function highlightCard(brandId) {
    clearHighlight();
    if (brandId) {
        const img = $(brandId);
        if (img) {
            img.classList.add('hl');
        }
    }
}

function getBrandName(brandId) {
    const names = {
        'visa': 'VISA',
        'mc': 'MasterCard',
        'maestro': 'Maestro',
        'mir': 'МИР'
    };
    return names[brandId] || 'Неизвестная';
}

document.addEventListener('DOMContentLoaded', () => {
    const input = $('cardNumber');
    const checkButton = $('cardCheck');
    const clearButton = $('clearBtn');
    const resultDiv = $('result');

    // Автоматическое форматирование при вводе
    input.addEventListener('input', () => {
        // Получаем текущую позицию курсора
        const startPos = input.selectionStart;
        
        // Удаляем всё кроме цифр
        let value = digitsOnly(input.value);
        
        // Ограничиваем 16 цифрами
        if (value.length > 16) {
            value = value.slice(0, 16);
        }
        
        // Форматируем с пробелами
        const formattedValue = formatCardNumber(value);
        
        // Обновляем значение
        input.value = formattedValue;
        
        // Восстанавливаем позицию курсора (с учетом добавленных пробелов)
        const newPos = input.selectionStart;
        input.setSelectionRange(newPos, newPos);
        
        // Очищаем результат при изменении ввода
        clearHighlight();
        resultDiv.textContent = '';
        resultDiv.className = '';
    });

    checkButton.addEventListener('click', () => {
        const raw = input.value;
        const num = digitsOnly(raw);

        if (num.length !== 16) {
            resultDiv.textContent = `Ошибка: номер карты должен содержать ровно 16 цифр (введено: ${num.length})`;
            resultDiv.className = 'error';
            clearHighlight();
            return;
        }

        if (!luhnCheck(num)) {
            resultDiv.textContent = 'Ошибка: неверная контрольная сумма (алгоритм Луна)';
            resultDiv.className = 'error';
            clearHighlight();
            return;
        }

        const brandId = detectBrand(num);
        
        if (!brandId) {
            resultDiv.textContent = 'Номер карты корректен, но бренд не определен';
            resultDiv.className = 'info';
            clearHighlight();
            return;
        }

        // Показываем отформатированный номер
        const formattedNumber = formatCardNumber(num);
        
        resultDiv.innerHTML = `
            <strong>Карта корректна!</strong><br>
            Бренд: ${getBrandName(brandId)}<br>
            Номер: ${formattedNumber}<br>
            Контрольная сумма: пройдена
        `;
        resultDiv.className = 'success';
        highlightCard(brandId);
    });

    clearButton.addEventListener('click', () => {
        input.value = '';
        resultDiv.textContent = '';
        resultDiv.className = '';
        clearHighlight();
        input.focus();
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkButton.click();
        }
    });
});