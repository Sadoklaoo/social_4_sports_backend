// src/middlewares/authMiddleware.ts
import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const requireAuth: RequestHandler = (req, res, next) => {
  console.log('🔐 requireAuth middleware loaded');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach userId to req object for downstream use
    (req as any).userId = payload.id;  // <-- Assuming your JWT contains { id: userId }

    // Optional: attach entire payload if needed elsewhere
    (req as any).user = payload;

    next();
  } catch (err) {
    console.error('JWT error:', err);
    res.status(403).json({ message: 'Forbidden' });
  }
};

export default requireAuth;
