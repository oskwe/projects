import Fastify from 'fastify';
import FastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyPostgres from '@fastify/postgres';
import fastifyJwt from '@fastify/jwt';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.global' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });

fastify.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'lab11-local-development-secret',
});

fastify.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (error) {
    reply.code(401).send({ message: 'Требуется авторизация.' });
  }
});

// --- REGISTRATION STATIC ---
fastify.register(FastifyStatic, {
  root: path.join(__dirname, '..', 'public'),
  index: 'index.html',
  wildcard: false,
});

// --- REGISTRATION ROUTERS FOR LABS ---
import lab7Routes from './src/routes/lab7/index.js';
import lab8Routes from './src/routes/lab8/index.js';
import lab9Routes from './src/routes/lab9/index.js';
import lab10Routes from './src/routes/lab10/index.js';
import lab11Routes from './src/routes/lab11/index.js';
import lab12Routes from './src/routes/lab12/index.js';

fastify.register(lab7Routes, { prefix: '/api/lab7' });
fastify.register(lab8Routes, { prefix: '/api/lab8' });
fastify.register(lab9Routes, { prefix: '/api/lab9' });
fastify.register(lab10Routes, { prefix: '/api/lab10' });
fastify.register(lab11Routes, { prefix: '/api/lab11' });
fastify.register(lab12Routes, { prefix: '/api/lab12' });

// --- START SERVER ---
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
