// src/middleware/loggerMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';

export const loggerMiddleware = (logger: Logger) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();
    const { method, originalUrl, body, headers, params, query } = req;
    const ip = req.ip;

    logger.info(`${method} ${originalUrl}`, {
      body,
      ip,
      headers,
      params,
      query,
    });
    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2); // in ms
  
      logger.info(`Response: ${req.method} ${req.originalUrl} - ${res.statusCode} [${duration} ms]`, {
        body,
        ip,
        headers,
        params,
        query,
      });
    });
    next();
  };
}