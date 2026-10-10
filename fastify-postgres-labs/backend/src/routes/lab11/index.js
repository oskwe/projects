import authRoutes from './auth.js';
import secureRoutes from './secure.js';
import usersRoutes from './users.js';
import protectedLab10Routes from './protected-lab10.js';
import lab10Service from '../../services/lab10/lab10.service.js';
import userService from '../../services/lab11/user.service.js';

export default async function lab11Routes(fastify) {
    fastify.addHook('preHandler', async () => {
        await userService.ensureReady(fastify.pg);
        await lab10Service.ensureReady(fastify.pg);
    });

    fastify.register(authRoutes);
    fastify.register(secureRoutes);
    fastify.register(usersRoutes);
    fastify.register(protectedLab10Routes, { prefix: '/lab10' });
}
