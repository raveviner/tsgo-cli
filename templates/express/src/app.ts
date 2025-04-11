import express from 'express';
import { Logger } from 'winston';
import { loggerMiddleware } from './middleware/logger-middleware';
import { getStatusController } from './controllers/get-status-contoller';
import { errorHandler } from './middleware/error-handler';

export async function createApp(logger: Logger) {
  const app = express();

  app.use(express.json());
  app.use(loggerMiddleware(logger));
  
  getStatusController(app);

  app.use(errorHandler)

  return app;
}