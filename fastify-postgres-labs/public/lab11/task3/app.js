'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const roleInfo = document.getElementById('roleInfo');
    const message = document.getElementById('message');
    const productForm = document.getElementById('productForm');
    const productFormTitle = document.getElementById('productFormTitle');
    const productsTable = document.getElementById('productsTable');
    const scheduleForm = document.getElementById('scheduleForm');
    const scheduleFormTitle = document.getElementById('scheduleFormTitle');
    const scheduleFields = document.getElementById('scheduleFields');
    const scheduleTable = document.getElementById('scheduleTable');

    const state = {
        role: 'guest',
        categories: [],
        products: [],
        references: {},
        schedule: []
    };

    const referenceResources = ['groups', 'disciplines', 'teachers', 'rooms', 'lesson-types'];
    const scheduleFieldConfigs = [
        { name: 'week_number', label: 'Неделя', type: 'number' },
        { name: 'day_of_week', label: 'День 1..7', type: 'number' },
        { name: 'lesson_number', label: 'Пара', type: 'number' },
        { name: 'starts_at', label: 'Начало', type: 'time' },
        { name: 'ends_at', label: 'Конец', type: 'time' },
        { name: 'group_id', label: 'Группа', type: 'select', source: 'groups', text: 'name' },
        { name: 'discipline_id', label: 'Дисциплина', type: 'select', source: 'disciplines', text: 'name' },
        { name: 'teacher_id', label: 'Преподаватель', type: 'select', source: 'teachers', text: 'full_name' },
        { name: 'room_id', label: 'Аудитория', type: 'select', source: 'rooms', text: 'roomLabel' },
        { name: 'lesson_type_id', label: 'Тип', type: 'select', source: 'lesson-types', text: 'name' },
        { name: 'notes', label: 'Примечание', type: 'text' }
    ];

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

    async function detectRole() {
        if (!getToken()) {
            state.role = 'guest';
            return;
        }

        try {
            const profile = await parseResponse(await fetch('/api/lab11/profile', {
                headers: authHeaders()
            }));
            state.role = profile.user?.role || 'user';
        } catch (error) {
            state.role = 'guest';
        }
    }

    function applyRole() {
        const admin = state.role === 'admin';
        roleInfo.textContent = `Текущая роль: ${state.role}. Просмотр открыт всем, редактирование выполняется только через admin JWT.`;
        document.querySelectorAll('.admin-only').forEach(element => {
            element.hidden = !admin;
        });
    }

    function productPayload() {
        const data = Object.fromEntries(new FormData(productForm).entries());
        delete data.id;
        return data;
    }

    function resetProductForm() {
        productForm.reset();
        productForm.elements.id.value = '';
        productFormTitle.textContent = 'Создание товара';
    }

    function fillProductForm(product) {
        productForm.elements.id.value = product.id;
        productForm.elements.title.value = product.title;
        productForm.elements.price.value = product.price;
        productForm.elements.amount.value = product.amount;
        productForm.elements.category_id.value = product.category_id;
        productForm.elements.image.value = product.image || '';
        productFormTitle.textContent = `Редактирование товара #${product.id}`;
    }

    function renderProducts() {
        productForm.elements.category_id.innerHTML = state.categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('');
        productsTable.innerHTML = `
            <table>
                <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Остаток</th><th>Категория</th><th>Действия</th></tr></thead>
                <tbody>
                    ${state.products.map(product => `
                        <tr data-id="${product.id}">
                            <td>${product.id}</td>
                            <td>${product.title}</td>
                            <td>${product.price}</td>
                            <td>${product.amount}</td>
                            <td>${product.category_name || ''}</td>
                            <td>
                                ${state.role === 'admin' ? '<button type="button" data-action="edit-product">Редактировать</button><button type="button" class="danger" data-action="delete-product">Удалить</button>' : '<span class="muted">только просмотр</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function optionLabel(item, field) {
        if (field.text === 'roomLabel') {
            return `${item.building_code || ''} ${item.name}`.trim();
        }

        return item[field.text] || item.name || String(item.id);
    }

    function renderScheduleForm(values = {}) {
        scheduleFields.innerHTML = scheduleFieldConfigs.map(field => {
            const value = values[field.name] ?? '';

            if (field.type === 'select') {
                const options = state.references[field.source] || [];
                return `
                    <div>
                        <label>${field.label}</label>
                        <select name="${field.name}">
                            ${options.map(option => `<option value="${option.id}" ${String(option.id) === String(value) ? 'selected' : ''}>${optionLabel(option, field)}</option>`).join('')}
                        </select>
                    </div>
                `;
            }

            return `<div><label>${field.label}</label><input name="${field.name}" type="${field.type}" value="${value}"></div>`;
        }).join('');
    }

    function resetScheduleForm() {
        scheduleForm.reset();
        scheduleForm.elements.id.value = '';
        renderScheduleForm();
        scheduleFormTitle.textContent = 'Создание занятия';
    }

    function fillScheduleForm(entry) {
        scheduleForm.elements.id.value = entry.id;
        renderScheduleForm(entry);
        scheduleFormTitle.textContent = `Редактирование занятия #${entry.id}`;
    }

    function schedulePayload() {
        const data = Object.fromEntries(new FormData(scheduleForm).entries());
        delete data.id;
        return data;
    }

    function renderSchedule() {
        scheduleTable.innerHTML = `
            <table>
                <thead><tr><th>ID</th><th>Нед.</th><th>День</th><th>Пара</th><th>Время</th><th>Группа</th><th>Дисциплина</th><th>Действия</th></tr></thead>
                <tbody>
                    ${state.schedule.map(entry => `
                        <tr data-id="${entry.id}">
                            <td>${entry.id}</td>
                            <td>${entry.week_number}</td>
                            <td>${entry.day_of_week}</td>
                            <td>${entry.lesson_number}</td>
                            <td>${entry.starts_at}-${entry.ends_at}</td>
                            <td>${entry.group_name}</td>
                            <td>${entry.discipline_name}</td>
                            <td>
                                ${state.role === 'admin' ? '<button type="button" data-action="edit-schedule">Редактировать</button><button type="button" class="danger" data-action="delete-schedule">Удалить</button>' : '<span class="muted">только просмотр</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async function loadAll() {
        await detectRole();
        applyRole();

        state.categories = await parseResponse(await fetch('/api/lab11/lab10/shop/categories'));
        const productData = await parseResponse(await fetch('/api/lab11/lab10/shop/products?limit=50'));
        state.products = productData.items || [];

        for (const resource of referenceResources) {
            state.references[resource] = await parseResponse(await fetch(`/api/lab11/lab10/schedule/${resource}`));
        }

        state.schedule = await parseResponse(await fetch('/api/lab11/lab10/schedule/entries'));
        renderProducts();
        renderScheduleForm();
        renderSchedule();
        setMessage('Данные загружены.', 'success');
    }

    productForm.addEventListener('submit', async event => {
        event.preventDefault();
        const id = productForm.elements.id.value;

        try {
            await parseResponse(await fetch(id ? `/api/lab11/lab10/shop/products/${id}` : '/api/lab11/lab10/shop/products', {
                method: id ? 'PUT' : 'POST',
                headers: authHeaders(true),
                body: JSON.stringify(productPayload())
            }));
            resetProductForm();
            await loadAll();
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    productsTable.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]');

        if (!button) {
            return;
        }

        const id = Number(button.closest('[data-id]').dataset.id);
        const product = state.products.find(item => item.id === id);

        try {
            if (button.dataset.action === 'edit-product') {
                fillProductForm(product);
            }

            if (button.dataset.action === 'delete-product') {
                await parseResponse(await fetch(`/api/lab11/lab10/shop/products/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                }));
                await loadAll();
            }
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    scheduleForm.addEventListener('submit', async event => {
        event.preventDefault();
        const id = scheduleForm.elements.id.value;

        try {
            await parseResponse(await fetch(id ? `/api/lab11/lab10/schedule/entries/${id}` : '/api/lab11/lab10/schedule/entries', {
                method: id ? 'PUT' : 'POST',
                headers: authHeaders(true),
                body: JSON.stringify(schedulePayload())
            }));
            resetScheduleForm();
            await loadAll();
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    scheduleTable.addEventListener('click', async event => {
        const button = event.target.closest('[data-action]');

        if (!button) {
            return;
        }

        const id = Number(button.closest('[data-id]').dataset.id);
        const entry = state.schedule.find(item => item.id === id);

        try {
            if (button.dataset.action === 'edit-schedule') {
                fillScheduleForm(entry);
            }

            if (button.dataset.action === 'delete-schedule') {
                await parseResponse(await fetch(`/api/lab11/lab10/schedule/entries/${id}`, {
                    method: 'DELETE',
                    headers: authHeaders()
                }));
                await loadAll();
            }
        } catch (error) {
            setMessage(error.message, 'error');
        }
    });

    document.querySelectorAll('[data-tab]').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('shopPanel').hidden = button.dataset.tab !== 'shop';
            document.getElementById('schedulePanel').hidden = button.dataset.tab !== 'schedule';
            document.querySelectorAll('[data-tab]').forEach(item => item.classList.toggle('primary', item === button));
        });
    });

    document.getElementById('resetProductFormButton').addEventListener('click', resetProductForm);
    document.getElementById('resetScheduleFormButton').addEventListener('click', resetScheduleForm);
    document.getElementById('refreshButton').addEventListener('click', () => loadAll().catch(error => setMessage(error.message, 'error')));

    loadAll().catch(error => setMessage(error.message, 'error'));
});
