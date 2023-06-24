import cors from 'cors';
import express, {Application} from 'express';
import {PublicRouter} from './routers/PublicRouter';
import {errorMiddleware} from './middleware/errorMiddleware';
import httpLogger from 'morgan';
import {Logger} from './utils/Logger';
import {loggerMiddleware} from './middleware/loggerMiddleware';

const logger = Logger.getLogger();

export default class App {
    public express: Application;

    constructor() {
        this.express = express();
    }

    public async init(): Promise<void> {
        this.express.use(express.urlencoded({extended: true}));
        this.express.use(express.json());
        this.express.use(cors());
        this.express.use(loggerMiddleware);
        this.express.use(
            httpLogger('tiny', {
                stream: {write: (message) => logger.info(message)},
                skip: (_req, res) => res.statusCode >= 400, // error messages are handled by the error middleware
            })
        ); // logs the response
        this.routes();

        this.express.use(errorMiddleware); // should be last
    }

    private routes(): void {
        this.express.use('/', new PublicRouter().router);
    }
}
