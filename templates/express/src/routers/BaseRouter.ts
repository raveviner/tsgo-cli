import { Router, Request, Response, NextFunction } from 'express';

export abstract class BaseRouter {

    router: Router;

    constructor() {
        this.router = Router({ mergeParams: true });
        this.init();
    }

    protected abstract init(): void;

    protected wrapErrors(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await fn(req, res, next);
            } catch (error) {
                next(error);
            }
        };
    }

}