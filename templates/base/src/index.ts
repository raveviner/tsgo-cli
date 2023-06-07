import App from './App';

const port = process.env.PORT || 3000;

const app = new App();
app.init();

const server = app.express.listen(port, () => {
    console.log(`⚡[server]︰ Listening to port ${port}`);
});

const exitHandler = () => {
    if (server) {
        server.close(() => {
            console.log('⚡[server]︰ Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: string) => {
    console.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    console.log('⚡[server]︰ SIGTERM received');
    if (server) {
        server.close();
    }
});
