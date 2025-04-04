import { Request, Response } from 'express';

export const getStatus = (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Service is running.' });
};
