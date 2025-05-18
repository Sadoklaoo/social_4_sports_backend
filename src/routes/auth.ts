// src/routes/auth.ts
import { Router } from 'express';
import { signup, login, me } from '../controllers/authController';
import { wrap } from '../middlewares/errorHandler';
import requireAuth from '../middlewares/authMiddleware';

const router = Router();

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - location
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Alice Example
 *               email:
 *                 type: string
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               avatar:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               skillLevel:
 *                 type: string
 *                 enum: [beginner, intermediate, pro]
 *                 example: intermediate
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     example: [19.0, 47.5]
 *     responses:
 *       201:
 *         description: Created user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/signup', wrap(signup));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 */
router.post('/login', wrap(login));

/**
 * @openapi
 * components:
 *   schemas:
 *     MeResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *         skillLevel:
 *           type: string
 *           enum: [beginner, intermediate, pro]
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [Point]
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 *           example:
 *             type: Point
 *             coordinates: [19.040236, 47.497912]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeResponse'
 *       401:
 *         description: Missing or invalid JWT
 */
router.get('/me', requireAuth, wrap(me));
export default router;
