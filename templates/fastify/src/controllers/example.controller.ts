import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyBaseLogger, FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';

export function exampleController({
  logger,
}: {
  logger: FastifyBaseLogger;
}): FastifyPluginCallback {
  return (fastify) => {
    fastify.withTypeProvider<JsonSchemaToTsProvider>().get('/example', async (req, res) => {
      logger.info('GET /example');
      return res.status(StatusCodes.OK).send({ message: 'Hello from Fastify API!' });
    });

    fastify.withTypeProvider<JsonSchemaToTsProvider>().post(
      '/example',
      {
        schema: {
          body: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                timestamp: { type: 'string' },
              },
            },
          },
        } as const,
      },
      async (req, res) => {
        logger.info('POST /example');
        const { name } = req.body as { name: string };
        return res.status(StatusCodes.OK).send({
          message: `Hello, ${name}!`,
          timestamp: new Date().toISOString(),
        });
      }
    );
  };
}
