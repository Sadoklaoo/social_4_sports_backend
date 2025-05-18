// src/controllers/authController.ts
import { RequestHandler } from 'express';
import * as authService from '../services/authService';

/**
 * POST /api/auth/signup
 */
export const signup: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json(user);
  } catch (err: unknown) {
    // `err` might not be Error, so guard:
    const error = err instanceof Error ? err : new Error('Signup failed');
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error('Login failed');
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return current authenticated user info
 */
export const me: RequestHandler = (req, res) => {
  // @ts-ignore: user injected by authMiddleware
  const user = req.user;
  res.json(user);
};
