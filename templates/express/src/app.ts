import express from 'express';
import routes from './routes';
import { errorHandler } from './middleware/error-handler';

export async function createApp(logger: express.RequestHandler) {
  const app = express();

  app.use(express.json());
  app.use(logger);

  app.use('/api', routes);

  app.use(errorHandler)

  return app;
}