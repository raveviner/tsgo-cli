import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyBaseLogger, FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { getExampleResponseSchema } from '../types/example.types.js';

export function getExampleController({
  logger,
}: {
  logger: FastifyBaseLogger;
}): FastifyPluginCallback {
  return (fastify) => {
    fastify.withTypeProvider<JsonSchemaToTsProvider>().get(
      '/example',
      {
        schema: {
          response: {
            200: getExampleResponseSchema,
          },
        } as const,
      },
      async (req, res) => {
        logger.info('GET /example');
        return res.status(StatusCodes.OK).send({ message: 'Hello from Fastify API!' });
      }
    );
  };
}
