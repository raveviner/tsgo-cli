// src/middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export const loggerMiddleware = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  };
}