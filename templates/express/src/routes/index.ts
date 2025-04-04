import { Router } from 'express';
import { getStatus } from '../controllers/status-contoller';

const router = Router();

/**
 * @openapi
 * /api/status:
 *   get:
 *     summary: Get service status
 *     responses:
 *       200:
 *         description: Service is running
 */
router.get('/status', getStatus);

export default router;
