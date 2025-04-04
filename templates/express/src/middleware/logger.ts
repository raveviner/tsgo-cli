import { Request, Response, NextFunction } from 'express';

export const createLogger = (appName: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${appName}] ${req.method} ${req.url}`);
    next();
  };
}