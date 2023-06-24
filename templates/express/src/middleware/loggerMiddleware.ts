import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/Logger';

const logger = Logger.getLogger();

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
    logger.info(`${req.method} ${req.url}`);
    next();
};
