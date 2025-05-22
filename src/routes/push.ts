import { Router } from 'express';
import { subscribe } from '../controllers/pushController';
import { requireAuth } from '../middlewares/authMiddleware';
import { wrap } from '../middlewares/errorHandler';

const router = Router();
/**
 * @openapi
 * /api/push/subscribe:
 *   post:
 *     summary: Register a Web Push subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *               keys:
 *                 type: object
 *                 properties:
 *                   p256dh:
 *                     type: string
 *                   auth:
 *                     type: string
 *     responses:
 *       201:
 *         description: Subscription saved
 */
router.post('/subscribe', requireAuth, wrap(subscribe));
export default router;
