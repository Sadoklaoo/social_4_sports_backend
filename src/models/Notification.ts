// src/models/Notification.ts
import { Schema, model, Types } from 'mongoose';

export interface INotification {
  recipient: Types.ObjectId;    // who should see it
  actor?: Types.ObjectId;       // who triggered it (e.g. friend requester)
  type: 
    | 'FriendRequest'
    | 'FriendRequestAccepted'
    | 'MatchInvite'
    | 'MatchInviteAccepted'
    | 'Review'
    | 'Message';                 // the notification’s type
  payload: any;                 // free-form: e.g. { matchId, reviewId }
  read: boolean;                // has the user viewed it?
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actor:     { type: Schema.Types.ObjectId, ref: 'User' },
  type:      {
    type: String,
    enum: [
      'FriendRequest',
      'FriendRequestAccepted',
      'MatchInvite',
      'MatchInviteAccepted',
      'Review',
      'Message'
    ],
    required: true
  },
  payload:   { type: Schema.Types.Mixed, required: true },
  read:      { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default model<INotification>('Notification', notificationSchema);
