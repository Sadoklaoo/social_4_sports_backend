import { Router } from 'express';
import {
  scheduleMatch,
  getUpcomingMatches,
  confirmMatch,
  cancelMatch,
  rescheduleMatch,
  getMatchHistory,
  completeMatch,
} from '../controllers/matchController';
import { requireAuth } from '../middlewares/authMiddleware';
import { wrap } from '../middlewares/errorHandler';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ScheduleMatch:
 *       type: object
 *       required: [opponent, location, scheduledFor]
 *       properties:
 *         opponent:
 *           type: string
 *         location:
 *           type: string
 *         scheduledFor:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/matches:
 *   post:
 *     summary: Schedule a new match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleMatch'
 *     responses:
 *       201:
 *         description: Match scheduled
 */
router.post('/', requireAuth, wrap(scheduleMatch));

/**
 * @openapi
 * /api/matches/upcoming:
 *   get:
 *     summary: Get upcoming matches
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming matches list
 */
router.get('/upcoming', requireAuth, wrap(getUpcomingMatches));

/**
 * @openapi
 * /api/matches/{id}/confirm:
 *   put:
 *     summary: Confirm an incoming match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Match confirmed
 */
router.put('/:id/confirm', requireAuth, wrap(confirmMatch));

/**
 * @openapi
 * /api/matches/{id}/reschedule:
 *   put:
 *     summary: Reschedule a match (initiator only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Match rescheduled
 */
router.put('/:id/reschedule', requireAuth, wrap(rescheduleMatch));

/**
 * @openapi
 * /api/matches/{id}:
 *   delete:
 *     summary: Cancel a match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Match cancelled
 */
router.delete('/:id', requireAuth, wrap(cancelMatch));

/**
 * @openapi
 * /api/matches/history:
 *   get:
 *     summary: Get completed match history
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Completed matches list
 */
router.get('/history', requireAuth, wrap(getMatchHistory));

/**
 * @openapi
 * /api/matches/{id}/complete:
 *   put:
 *     summary: Complete a confirmed match
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [score, result]
 *             properties:
 *               score:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["11-9", "9-11", "11-7"]
 *               result:
 *                 type: string
 *                 enum: [Win, Loss]
 *     responses:
 *       200:
 *         description: Match completed with score & result
 */
router.put('/:id/complete', requireAuth, wrap(completeMatch));

export default router;
