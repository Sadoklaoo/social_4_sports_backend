import Notification, { INotification } from '../models/Notification';

export async function createNotification(data: {
  recipient: string;
  actor?: string;
  type: INotification['type'];
  payload: any;
}) {
  return Notification.create(data);
}

export async function getNotifications(userId: string) {
  return Notification.find({ recipient: userId }).sort({ createdAt: -1 }).lean();
}

export async function markAsRead(notificationId: string) {
  return Notification.findByIdAndUpdate(notificationId, { read: true });
}

export async function deleteNotification(notificationId: string) {
  return Notification.findByIdAndDelete(notificationId);
}
