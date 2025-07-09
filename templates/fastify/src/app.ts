import fastifyCors from '@fastify/cors';
import Fastify, { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { getExampleController } from './controllers/get-example.controller.js';
import { postExampleController } from './controllers/post-example.controller.js';

interface AppError extends Error {
  statusCode?: number;
  name: string;
  message: string;
}

async function createApp({ logger }: { logger: boolean }): Promise<FastifyInstance> {
  // disable test coverage
  /* istanbul ignore next */
  const loggerConfig = logger
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            singleLine: true,
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

  // Register controllers
  app.register(
    async (apiRouter) => {
      apiRouter.register(getExampleController({ logger: app.log }));
      apiRouter.register(postExampleController({ logger: app.log }));
    },
    { prefix: '/api' }
  );

  // Health check endpoint
  app.get('/health', async (req, res) => {
    return res.status(StatusCodes.OK).send({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Global error handler
  // disable test coverage
  /* istanbul ignore next */
  app.setErrorHandler((error: AppError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;

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
