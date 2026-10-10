import bcrypt from 'bcryptjs';
import userService from '../../services/lab11/user.service.js';

function getDb(fastify) {
    return fastify.pg;
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

async function optionalUser(request) {
    try {
        await request.jwtVerify();
        return request.user;
    } catch (error) {
        return null;
    }
}

function requireAdmin(request, reply) {
    if (request.user?.role !== 'admin') {
        reply.code(403).send({ message: 'Доступ только для admin.' });
        return false;
    }

    return true;
}

function normalizeUserPayload(body, { passwordRequired = false } = {}) {
    const login = typeof body?.login === 'string' ? body.login.trim() : '';
    const password = body?.password;
    const fullName = typeof body?.full_name === 'string' ? body.full_name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const role = body?.role === 'admin' ? 'admin' : 'user';

    if (!login) {
        return { ok: false, message: 'Поле login обязательно.' };
    }

    if (passwordRequired && (typeof password !== 'string' || password.length < 4)) {
        return { ok: false, message: 'Поле password должно содержать не меньше 4 символов.' };
    }

    return {
        ok: true,
        value: { login, password, fullName, email, role }
    };
}

export default async function usersRoutes(fastify) {
    fastify.get('/users', async request => {
        const authUser = await optionalUser(request);
        const users = await userService.listUsers(getDb(fastify));

        return {
            role: authUser?.role || 'guest',
            items: users.map(user => authUser
                ? userService.sanitizeUser(user, { includePrivate: authUser.role === 'admin' })
                : userService.publicUser(user))
        };
    });

    fastify.get('/users/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const user = await userService.findUserById(getDb(fastify), id);

        if (!user) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        return userService.sanitizeUser(user, {
            includePrivate: request.user.role === 'admin' || request.user.id === id
        });
    });

    fastify.post('/users', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const validation = normalizeUserPayload(request.body, { passwordRequired: true });

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        if (await userService.isLoginTaken(getDb(fastify), validation.value.login)) {
            return reply.code(409).send({ message: 'Пользователь с таким login уже существует.' });
        }

        const passwordHash = await bcrypt.hash(validation.value.password, 10);
        const user = await userService.createUser(getDb(fastify), {
            ...validation.value,
            passwordHash
        });

        return reply.code(201).send({
            message: 'Пользователь создан.',
            user: userService.sanitizeUser(user, { includePrivate: true })
        });
    });

    fastify.put('/users/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const validation = normalizeUserPayload(request.body);

        if (!validation.ok) {
            return reply.code(400).send({ message: validation.message });
        }

        if (await userService.isLoginTaken(getDb(fastify), validation.value.login, id)) {
            return reply.code(409).send({ message: 'Пользователь с таким login уже существует.' });
        }

        const user = await userService.updateUser(getDb(fastify), id, validation.value);

        if (!user) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        return {
            message: 'Пользователь обновлён.',
            user: userService.sanitizeUser(user, { includePrivate: true })
        };
    });

    fastify.delete('/users/:id', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        if (id === Number(request.user.id)) {
            return reply.code(400).send({ message: 'Нельзя удалить текущего пользователя.' });
        }

        const deleted = await userService.deleteUser(getDb(fastify), id);

        if (!deleted) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        return { message: 'Пользователь удалён.' };
    });

    fastify.post('/users/:id/generate-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (!requireAdmin(request, reply)) {
            return;
        }

        const id = parseId(request.params.id);

        if (!id) {
            return reply.code(400).send({ message: 'Некорректный id.' });
        }

        const user = await userService.findUserById(getDb(fastify), id);

        if (!user) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        const password = userService.generatePassword();
        const passwordHash = await bcrypt.hash(password, 10);
        await userService.updatePasswordHash(getDb(fastify), id, passwordHash);

        return {
            message: 'Новый пароль сгенерирован.',
            password
        };
    });
}
