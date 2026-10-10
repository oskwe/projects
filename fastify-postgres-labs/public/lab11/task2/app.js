'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const roleInfo = document.getElementById('roleInfo');
    const editorPanel = document.getElementById('editorPanel');
    const editorTitle = document.getElementById('editorTitle');
    const userForm = document.getElementById('userForm');
    const usersTable = document.getElementById('usersTable');
    const userDetails = document.getElementById('userDetails');
    const detailsPanel = document.getElementById('detailsPanel');
    const message = document.getElementById('message');

    const state = {
        role: 'guest',
        users: []
    };

    function getToken() {
        return localStorage.getItem('lab11Token') || '';
    }

    function authHeaders(json = false) {
        const headers = {};

        if (json) {
            headers['Content-Type'] = 'application/json';
        }

        if (getToken()) {
            headers.Authorization = `Bearer ${getToken()}`;
        }

        return headers;
    }

    function setMessage(text, type = '') {
        message.textContent = text || '';
        message.className = 'message' + (type ? ` ${type}` : '');
    }

    async function parseResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Ошибка запроса.');
        }

        return data;
    }

    function applyRole() {
        editorPanel.hidden = state.role !== 'admin';
        detailsPanel.hidden = state.role === 'guest';
        roleInfo.textContent = `Текущая роль интерфейса: ${state.role}. Guest видит только список, user видит карточки, admin управляет пользователями.`;
    }

    function resetForm() {
        userForm.reset();
        userForm.elements.id.value = '';
        userForm.elements.password.disabled = false;
        editorTitle.textContent = 'Создание пользователя';
    }

    function fillForm(user) {
        userForm.elements.id.value = user.id;
        userForm.elements.login.value = user.login;
        userForm.elements.password.value = '';
        userForm.elements.password.disabled = true;
        userForm.elements.full_name.value = user.full_name || '';
        userForm.elements.email.value = user.email || '';
        userForm.elements.role.value = user.role;
        editorTitle.textContent = `Редактирование пользователя #${user.id}`;
    }

    function renderUsers() {
        if (!state.users.length) {
            usersTable.innerHTML = '<p>Пользователи не найдены.</p>';
            return;
        }

        usersTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Login</th>
                        <th>Full name</th>
                        <th>Role</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.users.map(user => `
                        <tr data-id="${user.id}">
                            <td>${user.id}</td>
                            <td>${user.login}</td>
                            <td>${user.full_name || ''}</td>
                            <td>${user.role}</td>
                            <td>
                                ${state.role !== 'guest' ? '<button type="button" data-action="details">Карточка</button>' : ''}
                                ${state.role === 'admin' ? '<button type="button" data-action="edit">Редактировать</button><button type="button" data-action="password">Пароль</button><button type="button" class="danger" data-action="delete">Удалить</button>' : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async function loadUsers() {
        const data = await parseResponse(await fetch('/api/lab11/users', {
            headers: authHeaders()
        }));

        state.role = data.role || 'guest';
        state.users = data.items || [];
        applyRole();
        renderUsers();
        setMessage(`Загружено пользователей: ${state.users.length}.`, 'success');
    }

    async function showDetails(id) {
        const data = await parseResponse(await fetch(`/api/lab11/users/${id}`, {
            headers: authHeaders()
        }));

        userDetails.textContent = JSON.stringify(data, null, 2);
        detailsPanel.hidden = false;
    }

    userForm.addEventListener('submit', async event => {
        event.preventDefault();
        const id = userForm.elements.id.value;
        const payload = Object.fromEntries(new FormData(userForm).entries());
        delete payload.id;

        if (id) {
            delete payload.password;
        }

        try {
            await parseResponse(await fetch(id ? `/api/lab11/users/${id}` : '/api/lab11/users', {
                method: id ? 'PUT' : 'POST',
                headers: authHeaders(true),
                body: JSON.stringify(payload)
            }));
            resetForm();
            await loadUsers();
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    usersTable.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]');

        if (!button) {
            return;
        }

        const id = Number(button.closest('[data-id]').dataset.id);
        const user = state.users.find(item => item.id === id);

        try {
            if (button.dataset.action === 'details') {
                await showDetails(id);
            }

            if (button.dataset.action === 'edit') {
                fillForm(user);
            }

            if (button.dataset.action === 'delete') {
                await parseResponse(await fetch(`/api/lab11/users/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                }));
                await loadUsers();
            }

            if (button.dataset.action === 'password') {
                const data = await parseResponse(await fetch(`/api/lab11/users/${id}/generate-password`, {
                    method: 'POST',
                    headers: authHeaders()
                }));
                setMessage(`Новый пароль для ${user.login}: ${data.password}`, 'success');
            }
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    document.getElementById('resetFormButton').addEventListener('click', resetForm);
    document.getElementById('refreshButton').addEventListener('click', () => {
        loadUsers().catch(error => setMessage(error.message, 'error'));
    });

    loadUsers().catch(error => {
        applyRole();
        setMessage(error.message, 'error');
    });
});
