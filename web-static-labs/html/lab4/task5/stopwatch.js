'use strict';

let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let isRunning = false;


function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    const pad = (n) => String(n).padStart(2, '0');
    
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(milliseconds)}`;
}


function updateDisplay() {
    document.getElementById('display').textContent = formatTime(elapsedTime);
}


function start() {
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 10);
    }
}

function stop() {
    if (isRunning) {
        isRunning = false;
        clearInterval(timerInterval);
    }
}


function reset() {
    stop();
    elapsedTime = 0;
    updateDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startBtn').addEventListener('click', start);
    document.getElementById('stopBtn').addEventListener('click', stop);
    document.getElementById('resetBtn').addEventListener('click', reset);
    updateDisplay();
});