import { type FastifyInstance } from 'fastify';
import { createApp } from '../../../src/app.js';
import { GetExampleResponse, PostExampleResponse } from '../../../src/types/example.types.js';

describe('Example Controller', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/example', () => {
    it('should return 200 and hello message', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/example',
      });

      expect(response.statusCode).toBe(200);

      const body = response.json<GetExampleResponse>();
      expect(body).toHaveProperty('message', 'Hello from Fastify API!');
    });
  });

  describe('POST /api/example', () => {
    it('should return 200 and personalized greeting with timestamp', async () => {
      const testName = 'Tester';
      const response = await app.inject({
        method: 'POST',
        url: '/api/example',
        payload: { name: testName },
      });

      expect(response.statusCode).toBe(200);

      const body = response.json<PostExampleResponse>();
      expect(body).toHaveProperty('message', `Hello, ${testName}!`);
      expect(body).toHaveProperty('timestamp');
      expect(new Date(body.timestamp).getTime()).not.toBeNaN();
    });

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/example',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
      expect(response.json<PostExampleResponse>()).toHaveProperty(
        'message',
        "body must have required property 'name'"
      );
    });
  });
});
