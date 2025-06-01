import { Router } from 'express';
import { deleteNotif, listNotifications, markRead } from '../controllers/notificationController';
import { requireAuth } from '../middlewares/authMiddleware';
import { wrap } from '../middlewares/errorHandler';

const router = Router();

/**
 * @openapi
 * /api/notifications:
 *   get:
 *     summary: List all notifications for the current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/', requireAuth, wrap(listNotifications));

/**
 * @openapi
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: No Content
 */
router.patch('/:id/read', requireAuth, wrap(markRead));

/**
 * @openapi
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: No Content
 */
router.delete('/:id', requireAuth, wrap(deleteNotif));

export default router;
