// src/controllers/notificationController.ts
import { Request, Response, NextFunction } from 'express';
import * as notifService from '../services/notificationService';

export const listNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    console.log('🔍 UserID in controller:', userId);
    const notifs = await notifService.getNotifications(userId);
    console.log('🔍 Fetched notifications:', notifs);
    res.json(notifs);
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.markAsRead(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export const deleteNotif = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notifService.deleteNotification(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
