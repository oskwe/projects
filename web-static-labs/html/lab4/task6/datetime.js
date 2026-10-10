'use strict';

// Проверка формата и корректности даты/времени
function checkDateTime(str) {
    // Регулярное выражение для формата: дд-мм-гггг чч:мм:сс
    const formatRegex = /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$/;
    
    // Проверка формата
    if (!formatRegex.test(str)) {
        return { format: false, data: false, message: 'Формат некорректен' };
    }
    
    // Разбираем дату и время
    const parts = str.split(' ');
    const dateParts = parts[0].split('-');
    const timeParts = parts[1].split(':');
    
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    
    // Проверка корректности данных
    if (month < 1 || month > 12) {
        return { format: true, data: false, message: 'Неверный месяц' };
    }
    
    if (hours < 0 || hours > 23) {
        return { format: true, data: false, message: 'Неверный час' };
    }
    
    if (minutes < 0 || minutes > 59) {
        return { format: true, data: false, message: 'Неверная минута' };
    }
    
    if (seconds < 0 || seconds > 59) {
        return { format: true, data: false, message: 'Неверная секунда' };
    }
    
    // Проверка дня в месяце
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day < 1 || day > daysInMonth) {
        return { format: true, data: false, message: 'Неверный день' };
    }
    
    return { format: true, data: true, message: 'Формат корректен, данные корректны' };
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('datetimeInput');
    const button = document.getElementById('checkBtn');
    const result = document.getElementById('result');
    
    button.addEventListener('click', () => {
        const str = input.value.trim();
        
        if (!str) {
            result.textContent = 'Введите дату и время';
            result.className = 'result error';
            return;
        }
        
        const check = checkDateTime(str);
        
        if (check.format && check.data) {
            result.textContent = '' + check.message;
            result.className = 'result success';
        } else if (check.format && !check.data) {
            result.textContent = '' + check.message + ', данные некорректны';
            result.className = 'result error';
        } else {
            result.textContent = '' + check.message + ', данные не проверяются';
            result.className = 'result error';
        }
    });
    
    // Проверка по Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            button.click();
        }
    });
});