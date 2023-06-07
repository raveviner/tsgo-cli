import cors from 'cors';
import express, {Application} from 'express';
import { PublicRouter } from './routers/PublicRouter';

export default class App {
    public express: Application;

    constructor() {
        this.express = express();
    }

    public async init(): Promise<void> {
        this.express.use(express.urlencoded({extended: true}));
        this.express.use(express.json());
        this.express.use(cors());
        this.routes();
    }

    private routes(): void {
        this.express.use('/', new PublicRouter().router);
    }
}
