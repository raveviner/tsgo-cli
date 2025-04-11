import { Express, Request, Response } from 'express';

export function getStatusController(app: Express) {
  /**
   * @openapi
   * /api/status:
   *   get:
   *     summary: Get service status
   *     responses:
   *       200:
   *         description: Service is running
   */
  app.get('/api/status', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Service is running.' });
  });
}


