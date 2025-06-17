import { type FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';

describe('Application', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return 200 and health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);

      const body = response.json();
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('timestamp');
      expect(new Date(body.timestamp).getTime()).not.toBeNaN();
    });
  });
});
