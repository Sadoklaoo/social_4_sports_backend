// src/services/messageService.ts
import Message, { IMessage } from '../models/Message';
import { Types, FilterQuery } from 'mongoose';

export interface SendMessageInput {
  senderId: string;
  recipientId: string;
  content: string;
}

/**
 * Persist a new chat message
 */
export const sendMessage = async (
  data: SendMessageInput
): Promise<IMessage> => {
  return Message.create({
    sender: new Types.ObjectId(data.senderId),
    recipient: new Types.ObjectId(data.recipientId),
    content: data.content,
  });
};

export interface GetConversationParams {
  userId: string;        // the requester
  peerId: string;        // the other user
  limit?: number;
  before?: Date;         // for pagination: messages before this date
}

/**
 * Fetch messages between two users, most recent first
 */
export const getConversation = async (
  params: GetConversationParams
): Promise<IMessage[]> => {
  const { userId, peerId, limit = 50, before } = params;

  const userObjectId = new Types.ObjectId(userId);
  const peerObjectId = new Types.ObjectId(peerId);

  // query typed as FilterQuery<IMessage>
  const query: FilterQuery<IMessage> = {
    $or: [
      { sender: userObjectId, recipient: peerObjectId },
      { sender: peerObjectId, recipient: userObjectId },
    ],
  };

  if (before) {
    // Use Mongoose's own type for createdAt
    query.createdAt = { $lt: before } as FilterQuery<IMessage>['createdAt'];
  }

  return Message.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
};

export interface MarkReadParams {
  userId: string;
  peerId: string;
}

/**
 * Mark all messages FROM peer to user as read
 */
export const markConversationRead = async (
  params: MarkReadParams
): Promise<number> => {
  const { userId, peerId } = params;

  // Build a FilterQuery<IMessage> without any `any`
  const filter: FilterQuery<IMessage> = {
    sender: new Types.ObjectId(peerId),
    recipient: new Types.ObjectId(userId),
    readAt: { $exists: false },
  };

  const res = await Message.updateMany(
    filter,
    { $set: { readAt: new Date() } }
  ).exec();

  return res.modifiedCount;
};
