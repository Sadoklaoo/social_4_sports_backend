// src/controllers/messageController.ts
import { RequestHandler } from 'express';
import * as messageService from '../services/messageService';
import { IMessage } from '../models/Message';

interface SendMessageDTO {
  recipientId: string;
  content: string;
}

interface ConversationQuery {
  before?: string;   // ISO date string
  limit?: string;    // number as string
}

interface ConversationParams {
  peerId: string;
}

interface ReadParams {
  peerId: string;
}

/**
 * POST /api/messages
 * Send a new chat message
 */
export const sendMessage: RequestHandler<{}, IMessage | { message: string }, SendMessageDTO> =
  async (req, res, next) => {
    try {
      // @ts-ignore: user injected by auth middleware
      const senderId: string = req.user.id;
      const { recipientId, content } = req.body;
      if (!recipientId || !content) {
        res.status(400).json({ message: 'recipientId and content are required' });
        return;
      }

      const message = await messageService.sendMessage({ senderId, recipientId, content });
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  };

/**
 * GET /api/messages/:peerId
 * Fetch conversation with a peer (supports pagination via query)
 */
export const getConversation: RequestHandler<
  ConversationParams,
  IMessage[],
  {},
  ConversationQuery
> = async (req, res, next) => {
  try {
    // @ts-ignore: user injected by auth middleware
    const userId: string = req.user.id;
    const { peerId } = req.params;
    const { before, limit } = req.query;

    const conversation = await messageService.getConversation({
      userId,
      peerId,
      before: before ? new Date(before) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    res.json(conversation);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/messages/:peerId/read
 * Mark all messages from peer as read
 */
export const markRead: RequestHandler<ReadParams> = async (req, res, next) => {
  try {
    const { peerId } = req.params;
    // @ts-ignore: user injected by auth middleware
    const userId: string = req.user.id;
    const count = await messageService.markConversationRead({ userId, peerId });
    res.json({ updated: count });
  } catch (err) {
    next(err);
  }
};
