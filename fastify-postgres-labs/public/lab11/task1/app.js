'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const tokenState = document.getElementById('tokenState');
    const tokenPreview = document.getElementById('tokenPreview');
    const requestView = document.getElementById('requestView');
    const responseView = document.getElementById('responseView');
    const lastStatus = document.getElementById('lastStatus');
    const tests = document.getElementById('tests');

    function getToken() {
        return localStorage.getItem('lab11Token') || '';
    }

    function setToken(token) {
        if (token) {
            localStorage.setItem('lab11Token', token);
        } else {
            localStorage.removeItem('lab11Token');
        }

        renderToken();
    }

    function renderToken() {
        const token = getToken();
        tokenState.textContent = token ? 'JWT сохранён в localStorage.lab11Token.' : 'JWT отсутствует. Запросы profile/admin будут получать 401.';
        tokenPreview.textContent = token || 'Нет токена';
    }

    function formJson(form) {
        return Object.fromEntries(new FormData(form).entries());
    }

    async function apiRequest(method, url, body = null, useAuth = false) {
        const headers = {};

        if (body) {
            headers['Content-Type'] = 'application/json';
        }

        if (useAuth && getToken()) {
            headers.Authorization = `Bearer ${getToken()}`;
        }

        const options = { method, headers };

        if (body) {
            options.body = JSON.stringify(body);
        }

        requestView.textContent = JSON.stringify({ method, url, headers, body }, null, 2);
        const response = await fetch(url, options);
        const text = await response.text();
        let data = text;

        try {
            data = JSON.parse(text);
        } catch (error) {
            data = text;
        }

        lastStatus.textContent = `${response.status} ${response.statusText}`;
        responseView.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return { response, data };
    }

    document.getElementById('registerForm').addEventListener('submit', async event => {
        event.preventDefault();
        await apiRequest('POST', '/api/lab11/register', formJson(event.target));
    });

    document.getElementById('loginForm').addEventListener('submit', async event => {
        event.preventDefault();
        const { response, data } = await apiRequest('POST', '/api/lab11/login', formJson(event.target));

        if (response.ok && data.token) {
            setToken(data.token);
        }
    });

    document.getElementById('logoutButton').addEventListener('click', async () => {
        await apiRequest('POST', '/api/lab11/logout');
        setToken('');
    });

    document.getElementById('profileButton').addEventListener('click', async () => {
        await apiRequest('GET', '/api/lab11/profile', null, true);
    });

    document.getElementById('adminButton').addEventListener('click', async () => {
        await apiRequest('GET', '/api/lab11/admin', null, true);
    });

    document.getElementById('passwordForm').addEventListener('submit', async event => {
        event.preventDefault();
        await apiRequest('POST', '/api/lab11/change-password', formJson(event.target), true);
    });

    const testCases = [
        ['1. Register', 'POST /api/lab11/register', { login: 'student', password: '1234', full_name: 'Student User', email: 'student@example.local' }],
        ['2. Login', 'POST /api/lab11/login', { login: 'student', password: '1234' }],
        ['3. Profile with Bearer token', 'GET /api/lab11/profile', null],
        ['4. Admin route as user', 'GET /api/lab11/admin', null],
        ['5. Change password', 'POST /api/lab11/change-password', { current_password: '1234', new_password: '5678' }]
    ];

    tests.innerHTML = testCases.map(([title, endpoint, body]) => `
        <article class="panel">
            <h3>${title}</h3>
            <pre>${JSON.stringify({ endpoint, body, authorization: endpoint.includes('profile') || endpoint.includes('admin') ? 'Bearer token' : 'если требуется Bearer token' }, null, 2)}</pre>
            <div class="placeholder">Место для скриншота результата Postman/браузера или ручного пояснения проверки.</div>
        </article>
    `).join('');

    renderToken();
});
