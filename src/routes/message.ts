import { Router } from 'express';
import { sendMessage, getConversation, markRead } from '../controllers/messageController';
import { requireAuth } from '../middlewares/authMiddleware';
import { IMessage } from '../models/Message';
import { wrap } from '../middlewares/errorHandler';

const router = Router();

/**
 * @openapi
 * /api/messages:
 *   post:
 *     summary: Send a new chat message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId, content]
 *             properties:
 *               recipientId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/', requireAuth, wrap(sendMessage));

/**
 * @openapi
 * /api/messages/{peerId}:
 *   get:
 *     summary: Retrieve chat history with a peer
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: peerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Return messages sent before this ISO timestamp
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Max number of messages to return
 *     responses:
 *       200:
 *         description: Array of message objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get<{ peerId: string }, IMessage[]>(
  '/:peerId',
  requireAuth,
  wrap(getConversation)
);

/**
 * @openapi
 * /api/messages/{peerId}/read:
 *   put:
 *     summary: Mark all messages from peer as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: peerId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the peer whose messages will be marked read
 *     responses:
 *       200:
 *         description: Number of messages updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 */
router.put< 
  { peerId: string },          // req.params
  { updated: number },         // res body
  {},                          // req body
  {}                           // req query
>(
  '/:peerId/read',
  requireAuth,
  wrap(markRead)
);
export default router;
