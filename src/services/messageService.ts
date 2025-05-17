import Message, { IMessage } from '../models/Message';
import { Types } from 'mongoose';

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

  const query: any = {
    $or: [
      { sender: userObjectId, recipient: peerObjectId },
      { sender: peerObjectId, recipient: userObjectId },
    ],
  };

  if (before) {
    query.createdAt = { $lt: before };
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
  const res = await Message.updateMany(
    { sender: peerId, recipient: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  ).exec();
  return res.modifiedCount;
};