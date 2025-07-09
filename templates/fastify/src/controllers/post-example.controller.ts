import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import type { FastifyBaseLogger, FastifyPluginCallback } from 'fastify';
import { StatusCodes } from 'http-status-codes';
import { postExampleBodySchema, postExampleResponseSchema } from '../types/example.types.js';

export function postExampleController({
  logger,
}: {
  logger: FastifyBaseLogger;
}): FastifyPluginCallback {
  return (fastify) => {
    fastify.withTypeProvider<JsonSchemaToTsProvider>().post(
      '/example',
      {
        schema: {
          body: postExampleBodySchema,
          response: {
            200: postExampleResponseSchema,
          },
        } as const,
      },
      async (req, res) => {
        logger.info('POST /example');
        const { name } = req.body;
        return res.status(StatusCodes.OK).send({
          message: `Hello, ${name}!`,
          timestamp: new Date().toISOString(),
        });
      }
    );
  };
}
