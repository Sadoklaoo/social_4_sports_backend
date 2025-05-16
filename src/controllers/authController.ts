// src/controllers/authController.ts
import { RequestHandler } from 'express';
import * as authService from '../services/authService';

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(tokens);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
