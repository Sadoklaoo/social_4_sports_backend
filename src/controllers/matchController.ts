// src/controllers/matchController.ts
import { RequestHandler } from 'express';
import * as matchService from '../services/matchService';

export const createMatch: RequestHandler = async (req, res, next) => {
  // pull user.id out; you’ll need to cast if you haven’t augmented Request
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const match = await matchService.createMatch(req.body, userId);
    res.status(201).json(match);   // <- just call, no return
  } catch (err) {
    next(err);                     // <- just call
  }
};

export const getMatchHistory: RequestHandler = async (req, res, next) => {
  const userId = (req as any).user?.id as string | undefined;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const history = await matchService.getMatchHistory(userId);
    res.json(history);             // <- call without return
  } catch (err) {
    next(err);
  }
};
