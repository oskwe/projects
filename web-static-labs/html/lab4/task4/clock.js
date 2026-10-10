'use strict';

// Города и часовые пояса
const cities = [
    { id: 'moscow', name: 'Москва', timezone: 'Europe/Moscow' },
    { id: 'tokyo', name: 'Токио', timezone: 'Asia/Tokyo' },
    { id: 'london', name: 'Лондон', timezone: 'Europe/London' },
    { id: 'newyork', name: 'Нью-Йорк', timezone: 'America/New_York' },
    { id: 'seattle', name: 'Сиэтл', timezone: 'America/Los_Angeles' }
];

// Форматирование времени
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Время для часового пояса
function getTimeForTimezone(timezone) {
    const now = new Date();
    const options = {
        timeZone: timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    return now.toLocaleTimeString('ru-RU', options);
}

// Создание часов для всех городов
function createClocks() {
    const container = document.getElementById('clocks');
    container.innerHTML = '';
    
    cities.forEach(city => {
        const div = document.createElement('div');
        div.className = 'clock';
        div.id = `clock-${city.id}`;
        div.innerHTML = `
            <div>${city.name}</div>
            <div class="time" id="time-${city.id}">--:--:--</div>
        `;
        container.appendChild(div);
    });
}

// Обновление времени
function updateClocks() {
    cities.forEach(city => {
        const timeEl = document.getElementById(`time-${city.id}`);
        if (timeEl) {
            timeEl.textContent = getTimeForTimezone(city.timezone);
        }
    });
}

// Выделение выбранного города
function highlightSelected(selectedId) {
    cities.forEach(city => {
        const clockEl = document.getElementById(`clock-${city.id}`);
        if (clockEl) {
            if (city.id === selectedId) {
                clockEl.classList.add('selected');
            } else {
                clockEl.classList.remove('selected');
            }
        }
    });
}

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('citySelect');
    
    // Создаем все часы
    createClocks();
    
    // Обновляем каждую секунду
    setInterval(updateClocks, 1000);
    updateClocks();
    
    // Выделение при смене города
    select.addEventListener('change', (e) => {
        highlightSelected(e.target.value);
    });
    
    // Выставляем первый город как выбранный
    highlightSelected(cities[0].id);
});