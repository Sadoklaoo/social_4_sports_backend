import {  RequestHandler } from 'express';
import PushSubscription from '../models/PushSubscription';

export const subscribe: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { endpoint, keys } = req.body;
    // Upsert subscription
    await PushSubscription.findOneAndUpdate(
      { user: userId, endpoint },
      { user: userId, endpoint, keys },
      { upsert: true }
    ).exec();
    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
};
