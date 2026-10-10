'use strict';

// Проверка сложности пароля
function checkPasswordStrength(password) {
    const result = {
        score: 0,
        criteria: []
    };
    
    const length = password.length;
    
    // Критерий 1: Длина менее 5
    if (length < 5) {
        result.criteria.push({ name: 'Длина менее 5', points: 0, pass: false });
        result.score = 0;
        return result; // Отменяет остальные критерии
    }
    
    // Критерии 2-4: Длина
    if (length >= 5 && length <= 9) {
        result.criteria.push({ name: 'Длина 5-9', points: 1, pass: true });
        result.score += 1;
    } else if (length >= 10 && length <= 12) {
        result.criteria.push({ name: 'Длина 10-12', points: 2, pass: true });
        result.score += 2;
    } else if (length > 12) {
        result.criteria.push({ name: 'Длина > 12', points: 3, pass: true });
        result.score += 3;
    }
    
    // Критерий 5: Типы символов (цифры, буквы, спецсимволы)
    const hasDigits = /\d/.test(password);
    const hasLetters = /[a-zA-Zа-яА-ЯёЁ]/.test(password);
    const hasSpecial = /[~!#$%^&*()_\-+=?/,.[\]{}<>|\\]/.test(password);
    
    let typeCount = 0;
    if (hasDigits) typeCount++;
    if (hasLetters) typeCount++;
    if (hasSpecial) typeCount++;
    
    const typePoints = Math.min(typeCount - 1, 2);
    if (typePoints > 0) {
        result.criteria.push({ name: 'Типы символов', points: typePoints, pass: true });
        result.score += typePoints;
    }
    
    // Критерий 6: Регистр букв
    const hasLower = /[a-zа-яё]/.test(password);
    const hasUpper = /[A-ZА-ЯЁ]/.test(password);
    
    if (hasLower && hasUpper) {
        result.criteria.push({ name: 'Разный регистр', points: 1, pass: true });
        result.score += 1;
    }
    
    // Критерий 7: Спецсимволы > 30% длины
    const specialCount = (password.match(/[~!#$%^&*()_\-+=?/,.[\]{}<>|\\]/g) || []).length;
    if (length > 0 && specialCount / length > 0.3) {
        result.criteria.push({ name: 'Спецсимволы > 30%', points: 2, pass: true });
        result.score += 2;
    }
    
    // Критерий 8: Все сочетания букв/цифр длиной < 3
    const sequences = password.match(/[a-zA-Zа-яА-ЯёЁ0-9]+/g) || [];
    const allShort = sequences.every(seq => seq.length < 3);
    if (allShort && sequences.length > 0) {
        result.criteria.push({ name: 'Короткие сочетания', points: 2, pass: true });
        result.score += 2;
    }
    
    // Ограничиваем максимум 10 баллами
    result.score = Math.min(result.score, 10);
    
    return result;
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('passwordInput');
    const button = document.getElementById('checkBtn');
    const result = document.getElementById('result');
    
    button.addEventListener('click', () => {
        const password = input.value;
        
        if (!password) {
            result.innerHTML = '<div class="score fail">Введите пароль</div>';
            return;
        }
        
        const check = checkPasswordStrength(password);
        
        // Определяем цвет оценки
        let colorClass = 'fail';
        if (check.score >= 8) colorClass = 'pass';
        else if (check.score >= 4) colorClass = 'pass';
        
        // Формируем вывод
        let html = `<div class="score ${colorClass}">Оценка: ${check.score} из 10</div>`;
        html += '<div class="criteria">';
        
        check.criteria.forEach(c => {
            const status = c.pass ? '' : '';
            html += `<div>${status} ${c.name}: +${c.points}</div>`;
        });
        
        html += '</div>';
        result.innerHTML = html;
    });
    
    // Проверка по Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            button.click();
        }
    });
});