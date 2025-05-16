// src/middlewares/authMiddleware.ts
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth: RequestHandler = (req, res, next) => {
  console.log('🔐 requireAuth middleware loaded');

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;              // <- just return, don’t return res...
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.user = payload; 
    next();               // <- call next(), don’t return next()
  } catch {
    res.status(403).json({ message: 'Forbidden' });
  }
};


export default requireAuth;