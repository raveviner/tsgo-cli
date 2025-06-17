import type { FastifyPluginAsync } from 'fastify';

const exampleController: FastifyPluginAsync = async function (fastify) {
  fastify.get('/example', async () => {
    return { message: 'Hello from Fastify API!' };
  });

  fastify.post(
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
    async (request) => {
      const { name } = request.body as { name: string };
      return {
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      };
    }
  );
};

export { exampleController };
