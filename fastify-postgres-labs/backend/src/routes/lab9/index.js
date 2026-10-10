import productService from '../../services/lab9/product.service.js';

const productBodySchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    price: { type: 'integer', minimum: 0 },
    amount: { type: 'integer', minimum: 0 },
    image: { type: 'string' },
  },
  required: ['title', 'price', 'amount'],
};

const productUpdateSchema = {
  type: 'object',
  properties: {
    title: { type: 'string', minLength: 1 },
    price: { type: 'integer', minimum: 0 },
    amount: { type: 'integer', minimum: 0 },
    image: { type: 'string' },
  },
  minProperties: 1,
};

const idParamsSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', minimum: 1 },
  },
  required: ['id'],
};

const purchaseBodySchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'integer', minimum: 1 },
          quantity: { type: 'integer', minimum: 1, maximum: 5 },
        },
        required: ['id', 'quantity'],
      },
    },
  },
  required: ['items'],
};

function unavailable(reply, error) {
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
    await productService.ensureReady(fastify.pg);
    return await action(fastify.pg);
  } catch (error) {
    fastify.log.error(error);
    return unavailable(reply, error);
  }
}

export default async function routes(fastify) {
  fastify.get('/', async () => ({
    lab: '№9',
    description: 'Основы работы с PostgreSQL в Fastify',
    status: 'ok',
  }));

  fastify.get('/products', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => productService.getAll(db, request.query.q || ''),
  ));

  fastify.get('/task1/products', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => productService.getAll(db, request.query.q || ''),
  ));

  fastify.get('/task1/stock', async (request, reply) => withDb(
    fastify,
    reply,
    (db) => productService.getStock(db),
  ));

  fastify.post('/products', { schema: { body: productBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => reply.code(201).send(await productService.create(db, request.body)),
  ));

  fastify.post('/products/purchase', { schema: { body: purchaseBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      try {
        const purchased = await productService.purchase(db, request.body.items);
        return reply.code(200).send({ message: 'Purchase completed', purchased });
      } catch (error) {
        return reply.code(400).send({ error: error.message });
      }
    },
  ));

  fastify.post('/products/check', { schema: { body: purchaseBodySchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const result = await productService.checkAvailability(db, request.body.items);
      if (!result.ok) {
        return reply.code(400).send({
          error: 'Not enough stock',
          unavailable: result.unavailable,
        });
      }

      return reply.code(200).send({
        message: 'Enough stock',
        items: result.checked,
        total: result.total,
      });
    },
  ));

  fastify.get('/products/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const product = await productService.getById(db, request.params.id);
      if (!product) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return product;
    },
  ));

  fastify.put(
    '/products/:id',
    { schema: { params: idParamsSchema, body: productUpdateSchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const product = await productService.update(db, request.params.id, request.body);
      if (!product) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return product;
    }),
  );

  fastify.patch(
    '/products/:id',
    { schema: { params: idParamsSchema, body: productUpdateSchema } },
    async (request, reply) => withDb(fastify, reply, async (db) => {
      const product = await productService.update(db, request.params.id, request.body);
      if (!product) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return product;
    }),
  );

  fastify.delete('/products/:id', { schema: { params: idParamsSchema } }, async (request, reply) => withDb(
    fastify,
    reply,
    async (db) => {
      const deleted = await productService.delete(db, request.params.id);
      if (!deleted) {
        return reply.code(404).send({ error: 'Product not found' });
      }
      return { message: 'Deleted', id: deleted.id };
    },
  ));
}
