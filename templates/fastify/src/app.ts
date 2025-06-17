import fastifyCors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { exampleController } from './controllers/example.controller.js';

interface AppError extends Error {
  statusCode?: number;
  name: string;
  message: string;
}

async function createApp({ logger }: { logger: boolean }): Promise<FastifyInstance> {
  /* istanbul ignore next */
  const loggerConfig = logger
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      }
    : false;

  const app = Fastify({
    logger: loggerConfig,
  });

  // Register plugins
  await app.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register routes
  app.register(exampleController, { prefix: '/api' });

  // Health check endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Global error handler
  /* istanbul ignore next */
  app.setErrorHandler((error: AppError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;

    app.log.error(error);
    void reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message: error.message || 'Something went wrong',
    });
  });

  return app;
}

export { createApp };
