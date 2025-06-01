
import { Types } from 'mongoose';
import Notification, { INotification } from '../models/Notification';
import { io } from '../server';

export async function createNotification(data: {
  recipient: string;
  actor?: string;
  type: INotification['type'];
  payload: any;
}) {
   const notif = Notification.create(data);
  // Emit real-time notification via Socket.IO
  io.to(`user:${data.recipient}`).emit('notification', {
    type: data.type,
    payload: data.payload,
    actor: data.actor,
    createdAt: (await notif).createdAt,
    _id: (await notif)._id,
  });
  return notif;

}

export async function getNotifications(userId: string) {
  return Notification.find({ recipient: new Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .lean();}

export async function markAsRead(notificationId: string) {
  return Notification.findByIdAndUpdate(notificationId, { read: true });
}

export async function deleteNotification(notificationId: string) {
  return Notification.findByIdAndDelete(notificationId);
}


