// src/routes/matches.ts
import { Router } from 'express';
import { createMatch, getMatchHistory } from '../controllers/matchController';
import requireAuth from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/matches:
 *   post:
 *     summary: Record a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Match'
 *     responses:
 *       201:
 *         description: Match created
 */
router.post('/', requireAuth, createMatch);

/**
 * @openapi
 * /api/matches/history:
 *   get:
 *     summary: Get your match history
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of match records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 */
router.get('/history',requireAuth, getMatchHistory);

export default router;
