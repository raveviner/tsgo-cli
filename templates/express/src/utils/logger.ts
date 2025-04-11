// src/logger.ts
import { createLogger as winstonCreateLogger, format, transports } from 'winston';

export const createLogger = (appName: string) => {
  return winstonCreateLogger({
    level: 'info',
    defaultMeta: { appName },
    format: format.combine(
      format.timestamp(),
      format.printf(({ level, message, timestamp }) => {
        return `[${appName}][${timestamp}] ${level.toUpperCase()}: ${message}`;
      })
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/app.log' }),
    ],
  });
}