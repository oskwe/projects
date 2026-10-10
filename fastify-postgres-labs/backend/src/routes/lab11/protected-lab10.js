import shopService from '../../services/lab10/shop.service.js';
import scheduleService, { getReferenceConfig } from '../../services/lab10/schedule.service.js';

function getDb(fastify) {
    return fastify.pg;
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function requireAdmin(request, reply) {
    if (request.user?.role !== 'admin') {
        reply.code(403).send({ message: 'Редактирование доступно только admin.' });
        return false;
    }

    return true;
}

function validateProductPayload(body) {
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const price = Number(body?.price);
    const amount = Number(body?.amount);
    const categoryId = Number(body?.category_id);
    const image = typeof body?.image === 'string' ? body.image.trim() : '';

    if (!title || !Number.isInteger(price) || price < 0 || !Number.isInteger(amount) || amount < 0 || !Number.isInteger(categoryId) || categoryId <= 0) {
        return {
            ok: false,
            message: 'Укажите title, price, amount и category_id. Числовые поля должны быть корректными.'
        };
    }

    return {
        ok: true,
        value: {
            title,
            price,
            amount,
            category_id: categoryId,
            image
        }
    };
}

function validateReferencePayload(resource, body) {
    const config = getReferenceConfig(resource);

    if (!config) {
        return { ok: false, message: 'Неизвестный справочник.' };
    }

    const data = {};

    for (const field of config.fields) {
        const value = body?.[field];
        data[field] = typeof value === 'string' ? value.trim() : value;
    }

    if (['departments', 'positions', 'persons', 'buildings', 'disciplines', 'groups', 'lesson-types'].includes(resource)) {
        const hasEmptyRequired = Object.entries(data).some(([key, value]) => key !== 'middle_name' && key !== 'address' && key !== 'faculty' && (value === undefined || value === null || value === ''));

        if (hasEmptyRequired) {
            return { ok: false, message: 'Заполните обязательные поля справочника.' };
        }
    }

    if (resource === 'teachers' && (!parseId(data.person_id) || !parseId(data.department_id) || !parseId(data.position_id))) {
        return { ok: false, message: 'Выберите person_id, department_id и position_id.' };
    }

    if (resource === 'rooms' && (!parseId(data.building_id) || !data.name)) {
        return { ok: false, message: 'Укажите building_id и name.' };
    }

    if (resource === 'groups') {
        data.course = Number(data.course);
    }

    if (resource === 'rooms') {
        data.building_id = Number(data.building_id);
        data.capacity = Number.isInteger(Number(data.capacity)) && Number(data.capacity) >= 0 ? Number(data.capacity) : 0;
    }

    if (resource === 'teachers') {
        data.person_id = Number(data.person_id);
        data.department_id = Number(data.department_id);
        data.position_id = Number(data.position_id);
    }

    return { ok: true, value: data };
}

function validateSchedulePayload(body) {
    const numericFields = [
        'week_number',
        'day_of_week',
        'lesson_number',
        'group_id',
        'discipline_id',
        'teacher_id',
        'room_id',
        'lesson_type_id'
    ];
    const payload = {
        starts_at: typeof body?.starts_at === 'string' ? body.starts_at.trim() : '',
        ends_at: typeof body?.ends_at === 'string' ? body.ends_at.trim() : '',
        notes: typeof body?.notes === 'string' ? body.notes.trim() : ''
    };

    for (const field of numericFields) {
        payload[field] = Number(body?.[field]);

        if (!Number.isInteger(payload[field]) || payload[field] <= 0) {
            return { ok: false, message: `Поле ${field} должно быть положительным целым числом.` };
        }
    }

    if (payload.day_of_week < 1 || payload.day_of_week > 7) {
        return { ok: false, message: 'day_of_week должен быть в диапазоне 1..7.' };
    }

    if (!/^\d{2}:\d{2}$/.test(payload.starts_at) || !/^\d{2}:\d{2}$/.test(payload.ends_at)) {
        return { ok: false, message: 'starts_at и ends_at должны быть в формате HH:MM.' };
    }

    return { ok: true, value: payload };
}

function registerReferenceRoutes(fastify, resource) {
    fastify.get(`/schedule/${resource}`, async () => {
        return scheduleService.listReference(getDb(fastify), resource);
    });

    fastify.post(`/schedule/${resource}`, { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const validation = validateReferencePayload(resource, request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const item = await scheduleService.createReference(getDb(fastify), resource, validation.value);
        return reply.code(201).send(item);
    });

    fastify.put(`/schedule/${resource}/:id`, { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const validation = validateReferencePayload(resource, request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const item = await scheduleService.updateReference(getDb(fastify), resource, id, validation.value);

        if (!item) {
            return reply.code(404).send({ message: 'Запись не найдена.' });
        }

        return item;
    });

    fastify.delete(`/schedule/${resource}/:id`, { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const deleted = await scheduleService.deleteReference(getDb(fastify), resource, id);

        if (!deleted) {
            return reply.code(404).send({ message: 'Запись не найдена.' });
        }

        return { message: 'Запись удалена.' };
    });
}

export default async function protectedLab10Routes(fastify) {
    fastify.get('/shop/categories', async () => {
        return shopService.getCategories(getDb(fastify));
    });

    fastify.get('/shop/products', async request => {
        return shopService.getProducts(getDb(fastify), {
            page: request.query?.page,
            limit: request.query?.limit,
            categoryId: request.query?.category,
            search: request.query?.q
        });
    });

    fastify.post('/shop/products', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const validation = validateProductPayload(request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const product = await shopService.createProduct(getDb(fastify), validation.value);
        return reply.code(201).send(product);
    });

    fastify.put('/shop/products/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const validation = validateProductPayload(request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const product = await shopService.updateProduct(getDb(fastify), id, validation.value);

        if (!product) {
            return reply.code(404).send({ message: 'Товар не найден.' });
        }

        return product;
    });

    fastify.delete('/shop/products/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const deleted = await shopService.deleteProduct(getDb(fastify), id);

        if (!deleted) {
            return reply.code(404).send({ message: 'Товар не найден.' });
        }

        return { message: 'Товар удалён.' };
    });

    for (const resource of ['departments', 'positions', 'persons', 'teachers', 'buildings', 'rooms', 'disciplines', 'groups', 'lesson-types']) {
        registerReferenceRoutes(fastify, resource);
    }

    fastify.get('/schedule/entries', async request => {
        return scheduleService.getScheduleEntries(getDb(fastify), request.query || {});
    });

    fastify.post('/schedule/entries', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const validation = validateSchedulePayload(request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const entry = await scheduleService.createScheduleEntry(getDb(fastify), validation.value);
        return reply.code(201).send(entry);
    });

    fastify.put('/schedule/entries/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const validation = validateSchedulePayload(request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        const entry = await scheduleService.updateScheduleEntry(getDb(fastify), id, validation.value);

        if (!entry) {
            return reply.code(404).send({ message: 'Запись расписания не найдена.' });
        }

        return entry;
    });

    fastify.delete('/schedule/entries/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const deleted = await scheduleService.deleteScheduleEntry(getDb(fastify), id);

        if (!deleted) {
            return reply.code(404).send({ message: 'Запись расписания не найдена.' });
        }

        return { message: 'Запись расписания удалена.' };
    });
}
