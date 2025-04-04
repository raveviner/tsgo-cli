import express from 'express';
import routes from './routes';

export async function createApp(logger: express.RequestHandler) {
  const app = express();

  app.use(express.json());
  app.use(logger);

  app.use('/api', routes);

  return app;
}