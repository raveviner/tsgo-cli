import { Request, Response } from 'express';
import { BaseRouter } from './BaseRouter';

export class PublicRouter extends BaseRouter {

    constructor() {
        super();
    }

    /**
    * @api {get} /health
    * 
    * @apiSuccess (Success 200)
    */
    public async health(req: Request, res: Response): Promise<void> {
        res.status(200).send('OK');
    } 

    init(): void {
        // connection test
        this.router.get('/health', this.wrapErrors(this.health));
    }

}
