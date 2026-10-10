'use strict';

const $ = (id) => document.getElementById(id);

const readNumber = (el) => {
    const raw = String(el.value).trim();
    return raw === '' ? NaN : Number(raw);
};

function calc(a, op, b, base) {
    switch(op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b === 0 ? NaN : a / b;
        
        case 'sqrt':
            if (a < 0) return NaN; 
            return Math.sqrt(a);
        case 'log':
            if (a <= 0 || base <= 0 || base === 1) return NaN;
            return Math.log(a) / Math.log(base);
            
        default: return NaN;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const operator = $('operator');
    const operand1 = $('operand1');
    const operand2 = $('operand2');
    const logBaseInput = $('logBase'); 
    const doCalc = $('doCalc');
    const resultEl = $('result');
    const roundCheck = $('roundCheck');
    
    operator.addEventListener('change', () => {
        const op = operator.value;
        
        if (op === 'sqrt') {
            operand2.disabled = true;
            operand2.value = ''; // Очищаем
            logBaseInput.classList.add('hidden');
            logBaseInput.disabled = true;
        } 
        else if (op === 'log') {
            operand2.disabled = true;
            operand2.value = '';
            logBaseInput.classList.remove('hidden'); 
            logBaseInput.disabled = false;
            logBaseInput.value = '10'; 
        } 
        else {

            operand2.disabled = false;
            logBaseInput.classList.add('hidden');
            logBaseInput.disabled = true;
        }
    });

    doCalc.addEventListener('click', () => {
        const a = readNumber(operand1);
        const op = operator.value;
        
        let b = NaN;
        let base = NaN;

        if (Number.isNaN(a)) {
            resultEl.textContent = 'Введите первое число';
            resultEl.style.color = 'red';
            return;
        }

        if (op === 'log') {
            base = readNumber(logBaseInput);
            if (Number.isNaN(base)) {
                resultEl.textContent = 'Введите основание логарифма';
                resultEl.style.color = 'red';
                return;
            }
        } else if (op !== 'sqrt') {
            b = readNumber(operand2);
            if (Number.isNaN(b)) {
                resultEl.textContent = 'Введите второе число';
                resultEl.style.color = 'red';
                return;
            }
        }
        let res = calc(a, op, b, base);

        // Обработка ошибок вычисления
        if (Number.isNaN(res) || !isFinite(res)) {
            resultEl.textContent = 'Ошибка вычисления';
            resultEl.style.color = 'red';
            return;
        }

        if (roundCheck.checked) {
            res = Math.round(res * 1000) / 1000;
        }
        resultEl.textContent = res;
        resultEl.style.color = '#333';
    });
});