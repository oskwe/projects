import userService from '../../services/lab11/user.service.js';

function getDb(fastify) {
    return fastify.pg;
}

export default async function secureRoutes(fastify) {
    fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const user = await userService.findUserById(getDb(fastify), request.user.id);

        if (!user) {
            return reply.code(404).send({ message: 'Пользователь не найден.' });
        }

        return {
            message: 'Профиль доступен.',
            user: userService.sanitizeUser(user, { includePrivate: true })
        };
    });

    fastify.get('/admin', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        if (request.user.role !== 'admin') {
            return reply.code(403).send({ message: 'Доступ только для admin.' });
        }

        return {
            message: 'Административная область доступна.',
            user: request.user
        };
    });
}
