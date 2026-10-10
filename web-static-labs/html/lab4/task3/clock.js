'use strict';

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${hours}.${minutes}.${seconds}`;
}

function updateClock() {
    const clock = document.getElementById('clock');
    const now = new Date();
    clock.textContent = formatTime(now);
}

setInterval(updateClock, 100);

updateClock();