import bcrypt from 'bcryptjs';
import userService from '../../services/lab11/user.service.js';

function getDb(fastify) {
    return fastify.pg;
}

function cleanLogin(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function cleanText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function signUserToken(fastify, user) {
    return fastify.jwt.sign({
        id: Number(user.id),
        login: user.login,
        role: user.role_name || user.role
    });
}

export default async function authRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const login = cleanLogin(request.body?.login);
        const password = request.body?.password;
        const fullName = cleanText(request.body?.full_name);
        const email = cleanText(request.body?.email);

        if (!login || typeof password !== 'string' || password.length < 4) {
            return reply.code(400).send({
                message: 'Укажите login и password длиной не меньше 4 символов.'
            });
        }

        if (await userService.isLoginTaken(getDb(fastify), login)) {
            return reply.code(409).send({ message: 'Пользователь с таким login уже существует.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await userService.createUser(getDb(fastify), {
            login,
            passwordHash,
            fullName,
            email,
            role: 'user'
        });

        return reply.code(201).send({
            message: 'Пользователь зарегистрирован.',
            user: userService.sanitizeUser(user, { includePrivate: true })
        });
    });

    fastify.post('/login', async (request, reply) => {
        const login = cleanLogin(request.body?.login);
        const password = request.body?.password;

        if (!login || typeof password !== 'string') {
            return reply.code(400).send({ message: 'Укажите login и password.' });
        }

        const user = await userService.findUserByLogin(getDb(fastify), login);
        const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false;

        if (!passwordOk) {
            return reply.code(401).send({ message: 'Неверный login или password.' });
        }

        return {
            message: 'Вход выполнен.',
            token: signUserToken(fastify, user),
            user: userService.sanitizeUser(user, { includePrivate: true })
        };
    });

    fastify.post('/logout', async () => {
        return {
            message: 'Logout выполнен на клиенте: удалите JWT из localStorage.'
        };
    });

    fastify.post('/change-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const currentPassword = request.body?.current_password;
        const newPassword = request.body?.new_password;

        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' || newPassword.length < 4) {
            return reply.code(400).send({
                message: 'Укажите current_password и new_password длиной не меньше 4 символов.'
            });
        }

        const user = await userService.findUserById(getDb(fastify), request.user.id);

        if (!user) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        const passwordOk = await bcrypt.compare(currentPassword, user.password_hash);

        if (!passwordOk) {
            return reply.code(400).send({ message: 'Текущий пароль указан неверно.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await userService.updatePasswordHash(getDb(fastify), user.id, passwordHash);

        return { message: 'Пароль изменён. Войдите заново с новым паролем.' };
    });
}
