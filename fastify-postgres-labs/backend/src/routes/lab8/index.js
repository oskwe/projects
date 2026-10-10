import task1Service from '../../services/lab8/task1.service.js';
import worldCupService from '../../services/lab8/worldcup.service.js';
import { initialsQuerySchema, projectStatusQuerySchema } from '../../schemas/lab8/task1.schema.js';

export default async function routes(fastify) {
  fastify.get('/', async () => ({
    lab: '№8',
    description: 'Файловые операции Node.js и базовая валидация Fastify',
    status: 'ok',
  }));

  fastify.get(
    '/task1/makeInitials',
    { schema: { querystring: initialsQuerySchema } },
    async (request) => task1Service.makeInitials(request.query),
  );

  fastify.get(
    '/task1/makeProjectStatus',
    { schema: { querystring: projectStatusQuerySchema } },
    async (request, reply) => {
      const result = await task1Service.makeProjectStatus(request.query);
      return reply.code(201).send(result);
    },
  );

  fastify.get('/task2/groups', async () => worldCupService.getGroups());
  fastify.get('/task2/stadiums', async () => worldCupService.getStadiums());
  fastify.get('/task3/results', async () => worldCupService.getResults());
}
