// src/routes/friends.ts
import { Router } from 'express';
import {
  sendRequest,
  respondRequest,
  listReceived,
  listSent,
  listFriends,
} from '../controllers/friendController';
import { wrap } from '../middlewares/errorHandler';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/friends/requests:
 *   post:
 *     summary: Send a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId]
 *             properties:
 *               recipientId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Friend request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequest'
 */
router.post(
  '/requests',
  requireAuth,
  wrap(sendRequest)
);

/**
 * @openapi
 * /api/friends/requests/{requestId}:
 *   put:
 *     summary: Accept or reject a friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accept]
 *             properties:
 *               accept:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated friend request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FriendRequest'
 */
router.put(
  '/requests/:requestId',
  requireAuth,
  wrap(respondRequest)
);

/**
 * @openapi
 * /api/friends/requests/received:
 *   get:
 *     summary: List incoming friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of incoming requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 */
router.get(
  '/requests/received',
  requireAuth,
  wrap(listReceived)
);

/**
 * @openapi
 * /api/friends/requests/sent:
 *   get:
 *     summary: List outgoing friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of sent requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 */
router.get(
  '/requests/sent',
  requireAuth,
  wrap(listSent)
);

/**
 * @openapi
 * /api/friends:
 *   get:
 *     summary: List all confirmed friends for the current user
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of friend objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   fullName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   since:
 *                     type: string
 */
router.get('/', requireAuth, wrap(listFriends));
export default router;
