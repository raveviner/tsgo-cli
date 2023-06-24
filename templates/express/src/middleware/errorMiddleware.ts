import {NextFunction, Request, Response} from 'express';
import {Logger} from '../utils/Logger';

const logger = Logger.getLogger();

export function errorMiddleware(error: Error, req: Request, res: Response, next: NextFunction): void {
    res.status(500).json({message: `Something went wrong, please try again`});
    logger.error(`${req.method} ${req.url} ${res.statusCode}, ${error.name}: ${error.message}`, error.stack);
    next();
}
