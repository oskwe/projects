'use strict';

// Проверка сложности пароля (10-балльная шкала)
function checkPasswordStrength(password) {
    let score = 0;
    const length = password.length;
    
    // Критерий 1: Длина менее 5 = 0 баллов
    if (length < 5) {
        return 0;
    }
    
    // Критерии 2-4: Длина
    if (length >= 5 && length <= 9) {
        score += 1;
    } else if (length >= 10 && length <= 12) {
        score += 2;
    } else if (length > 12) {
        score += 3;
    }
    
    // Критерий 5: Типы символов (макс +2)
    const hasDigits = /\d/.test(password);
    const hasLetters = /[a-zA-Zа-яА-ЯёЁ]/.test(password);
    const hasSpecial = /[~!#$%^&*()_\-+=?/,.[\]{}<>|\\]/.test(password);
    
    let typeCount = 0;
    if (hasDigits) typeCount++;
    if (hasLetters) typeCount++;
    if (hasSpecial) typeCount++;
    
    if (typeCount >= 2) score += Math.min(typeCount - 1, 2);
    
    // Критерий 6: Регистр букв (макс +1)
    const hasLower = /[a-zа-яё]/.test(password);
    const hasUpper = /[A-ZА-ЯЁ]/.test(password);
    if (hasLower && hasUpper) score += 1;
    
    // Критерий 7: Спецсимволы > 30% (+2)
    const specialCount = (password.match(/[~!#$%^&*()_\-+=?/,.[\]{}<>|\\]/g) || []).length;
    if (length > 0 && specialCount / length > 0.3) {
        score += 2;
    }
    
    // Критерий 8: Короткие сочетания (+2)
    const sequences = password.match(/[a-zA-Zа-яА-ЯёЁ0-9]+/g) || [];
    const allShort = sequences.every(seq => seq.length < 3);
    if (allShort && sequences.length > 0) {
        score += 2;
    }
    
    return Math.min(score, 10);
}

// Обновление индикатора
function updateIndicator(score) {
    const segments = document.querySelectorAll('.segment');
    
    // Сброс всех сегментов
    segments.forEach(seg => {
        seg.className = 'segment';
    });
    
    // Определение цвета
    let colorClass = 'active'; // красный
    if (score >= 8) colorClass = 'green';
    else if (score >= 4) colorClass = 'yellow';
    
    // Показываем сегменты по количеству баллов
    for (let i = 0; i < Math.min(score, 10); i++) {
        segments[i].classList.add(colorClass);
    }
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('passwordInput');
    const button = document.getElementById('checkBtn');
    const result = document.getElementById('result');
    
    // Проверка при вводе (индикатор обновляется сразу)
    input.addEventListener('input', () => {
        const password = input.value;
        if (password.length > 0) {
            const score = checkPasswordStrength(password);
            updateIndicator(score);
        } else {
            updateIndicator(0);
        }
    });
    
    // Проверка по кнопке
    button.addEventListener('click', () => {
        const password = input.value;
        
        if (!password) {
            result.innerHTML = '<div class="score">Введите пароль</div>';
            updateIndicator(0);
            return;
        }
        
        const score = checkPasswordStrength(password);
        updateIndicator(score);
        
        let color = 'red';
        if (score >= 8) color = 'green';
        else if (score >= 4) color = 'orange';
        
        result.innerHTML = `<div class="score" style="color: ${color}">Оценка: ${score} из 10</div>`;
    });
    
    // Проверка по Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            button.click();
        }
    });
});