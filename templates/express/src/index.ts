import App from './App';
import { Logger } from './utils/Logger';

const port = process.env.PORT || 3000;
const logger = Logger.getLogger();

const app = new App();
app.init();

const server = app.express.listen(port, () => {
    logger.info(`listening to port ${port}...`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            logger.info('server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: Error) => {
    logger.error(`${error.name}: ${error.message}`);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});
