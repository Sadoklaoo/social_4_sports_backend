import { Router } from 'express';
import {
  createReview,
  listReviewsByMatch,
} from '../controllers/reviewController';
import { wrap } from '../middlewares/errorHandler';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Create a post-match review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [matchId, revieweeId, rating]
 *             properties:
 *               matchId:
 *                 type: string
 *               revieweeId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 */
router.post('/', requireAuth, wrap(createReview));

/**
 * @openapi
 * /api/reviews/match/{matchId}:
 *   get:
 *     summary: List all reviews for a specific match
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/match/:matchId', wrap(listReviewsByMatch));

export default router;
