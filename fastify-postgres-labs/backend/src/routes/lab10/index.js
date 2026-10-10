import lab10Service from '../../services/lab10/lab10.service.js';

const idParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
  },
  required: ['id'],
};

const productsQuerySchema = {
  type: 'object',
  properties: {
    page: { type: 'integer', minimum: 1 },
    category: { type: 'integer', minimum: 1 },
    q: { type: 'string' },
  },
};

const buyBodySchema = {
  type: 'object',
  properties: {
    quantity: { type: 'integer', minimum: 1, maximum: 99 },
    customerName: { type: 'string', minLength: 1 },
    customerPhone: { type: 'string' },
  },
  required: ['quantity', 'customerName'],
};

const productBodySchema = {
  type: 'object',
  properties: {
    category_id: { type: 'integer', minimum: 1 },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string', minLength: 1 },
    price: { type: 'integer', minimum: 0 },
    amount: { type: 'integer', minimum: 0 },
    image: { type: 'string' },
  },
  required: ['category_id', 'title', 'description', 'price', 'amount'],
};

const categoryBodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
  },
  required: ['title'],
};

const directoryParamsSchema = {
  type: 'object',
  properties: {
    directory: { type: 'string', minLength: 1 },
  },
  required: ['directory'],
};

const directoryIdParamsSchema = {
  type: 'object',
  properties: {
    directory: { type: 'string', minLength: 1 },
    id: { type: 'integer', minimum: 1 },
  },
  required: ['directory', 'id'],
};

const directoryBodySchema = {
  type: 'object',
  additionalProperties: true,
};

const scheduleBodySchema = {
  type: 'object',
  properties: {
    week: { type: 'integer', enum: [1, 2] },
    day_of_week: { type: 'integer', minimum: 1, maximum: 6 },
    start_time: { type: 'string', minLength: 4 },
    group_id: { type: 'integer', minimum: 1 },
    classroom_id: { type: 'integer', minimum: 1 },
    discipline_id: { type: 'integer', minimum: 1 },
    teacher_id: { type: 'integer', minimum: 1 },
    lesson_type_id: { type: 'integer', minimum: 1 },
  },
  required: [
    'week',
    'day_of_week',
    'start_time',
    'group_id',
    'classroom_id',
    'discipline_id',
    'teacher_id',
    'lesson_type_id',
  ],
};

const scheduleUpdateSchema = {
  ...scheduleBodySchema,
  required: [],
  minProperties: 1,
};

const scheduleQuerySchema = {
  type: 'object',
  properties: {
    week: { type: 'integer', minimum: 1 },
    group: { type: 'integer', minimum: 1 },
    day: { type: 'integer', minimum: 1 },
    classroom: { type: 'integer', minimum: 1 },
    discipline: { type: 'integer', minimum: 1 },
    teacher: { type: 'integer', minimum: 1 },
    lessonType: { type: 'integer', minimum: 1 },
  },
};

function databaseUnavailable(reply, error) {
  return reply.code(503).send({
    error: 'Database unavailable',
    details: error.message,
  });
}

async function withDb(fastify, reply, action) {
  if (!fastify.pg) {
    return reply.code(503).send({
      error: 'Database unavailable',
      details: 'DATABASE_URL is not configured',
    });
  }

  try {
    await lab10Service.ensureReady(fastify.pg);
    return await action(fastify.pg);
  } catch (error) {
    fastify.log.error(error);
    return databaseUnavailable(reply, error);
  }
}

export default async function routes(fastify) {
  fastify.get('/', async () => ({
    lab: '10',
    description: 'Fastify, PostgreSQL, dynamic queries, pagination and transactions',
    status: 'ok',
  }));

  fastify.get('/categories', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => lab10Service.getCategories(db),
  ));

  fastify.post('/categories', { schema: { body: categoryBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => reply.code(201).send(await lab10Service.createCategory(db, request.body)),
  ));

  fastify.get('/products', { schema: { querystring: productsQuerySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    (db) => lab10Service.getProducts(db, request.query),
  ));

  fastify.get('/products/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const product = await lab10Service.getProductById(db, request.params.id);
      if (!product) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return product;
    },
  ));

  fastify.post('/products', { schema: { body: productBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => reply.code(201).send(await lab10Service.createProduct(db, request.body)),
  ));

  fastify.post(
    '/products/:id/buy',
    { schema: { params: idParamsSchema, body: buyBodySchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      try {
        const order = await lab10Service.buyProduct(db, request.params.id, request.body);
        return reply.code(200).send(order);
      } catch (error) {
        const status = error.statusCode || 400;
        return reply.code(status).send({
          error: error.message,
          available: error.available,
        });
      }
    }),
  );

  fastify.get('/task1/product/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const product = await lab10Service.getProductById(db, request.params.id);
      if (!product) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return product;
    },
  ));

  fastify.get('/task1/orders', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => lab10Service.getOrders(db),
  ));

  fastify.get('/task1/orders/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const order = await lab10Service.getOrderById(db, request.params.id);
      if (!order) {
        return reply.code(404).send({ error: 'Order not found' });
      }
      return order;
    },
  ));

  fastify.get('/task2/refs', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => lab10Service.getScheduleRefs(db),
  ));

  fastify.get(
    '/task2/schedule',
    { schema: { querystring: scheduleQuerySchema } },
    async (request, reply) => withDb(
      fastify,
      reply,
      (db) => lab10Service.listSchedule(db, request.query),
    ),
  );

  fastify.post('/task2/schedule', { schema: { body: scheduleBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => reply.code(201).send(await lab10Service.createSchedule(db, request.body)),
  ));

  fastify.put(
    '/task2/schedule/:id',
    { schema: { params: idParamsSchema, body: scheduleUpdateSchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const item = await lab10Service.updateSchedule(db, request.params.id, request.body);
      if (!item) {
        return reply.code(404).send({ error: 'Schedule item not found' });
      }
      return item;
    }),
  );

  fastify.delete('/task2/schedule/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const deleted = await lab10Service.deleteSchedule(db, request.params.id);
      if (!deleted) {
        return reply.code(404).send({ error: 'Schedule item not found' });
      }
      return { message: 'Deleted', id: deleted.id };
    },
  ));

  fastify.get('/task2/:directory', { schema: { params: directoryParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const rows = await lab10Service.listDirectory(db, request.params.directory);
      if (!rows) {
        return reply.code(404).send({ error: 'Directory not found' });
      }
      return rows;
    },
  ));

  fastify.post(
    '/task2/:directory',
    { schema: { params: directoryParamsSchema, body: directoryBodySchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const item = await lab10Service.createDirectoryItem(db, request.params.directory, request.body);
      if (!item) {
        return reply.code(404).send({ error: 'Directory not found' });
      }
      return reply.code(201).send(item);
    }),
  );

  fastify.put(
    '/task2/:directory/:id',
    { schema: { params: directoryIdParamsSchema, body: directoryBodySchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const item = await lab10Service.updateDirectoryItem(
        db,
        request.params.directory,
        request.params.id,
        request.body,
      );
      if (!item) {
        return reply.code(404).send({ error: 'Directory item not found' });
      }
      return item;
    }),
  );

  fastify.delete(
    '/task2/:directory/:id',
    { schema: { params: directoryIdParamsSchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const deleted = await lab10Service.deleteDirectoryItem(
        db,
        request.params.directory,
        request.params.id,
      );
      if (!deleted) {
        return reply.code(404).send({ error: 'Directory item not found' });
      }
      return { message: 'Deleted', id: deleted.id };
    }),
  );
}
