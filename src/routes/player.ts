// src/routes/players.ts
import { Router } from 'express';
import { searchPlayers } from '../controllers/playerController';
import { requireAuth } from '../middlewares/authMiddleware';
import { IUser } from '../models/User';
import { wrap } from '../middlewares/errorHandler';

// Define the query parameters type for the search endpoint
type QueryParams = {
  skillLevel?: 'beginner' | 'intermediate' | 'pro';
  lat: string;
  lng: string;
  radius?: string;
};

const router = Router();

/**
 * @openapi
 * /api/players/search:
 *   get:
 *     summary: Search for players by skill and proximity
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skillLevel
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, pro]
 *         description: Filter by skill level
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude for proximity search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude for proximity search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radius in meters (default 10000)
 *     responses:
 *       200:
 *         description: Array of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get<{}, IUser[], {}, QueryParams>(
  '/search',
  requireAuth,
  wrap(searchPlayers)
);

export default router;
