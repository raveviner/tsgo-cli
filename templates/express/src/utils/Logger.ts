import winston, { createLogger, format, transports } from 'winston';

const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export class Logger {

    private static instance = Logger.createLogger();

    public static getLogger(): winston.Logger {
        return Logger.instance;
    }

    private static createLogger(): winston.Logger {

        const consoleTransport = new transports.Console();
        consoleTransport.silent = false;

        const logger = createLogger({
            level: process.env.LOG_LEVEL || 'debug',
            format: format.combine(
                format.colorize(),
                format.simple()
            ),
            transports: [consoleTransport],
        });

        return logger;
    }

}
