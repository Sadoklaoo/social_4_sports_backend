import { RequestHandler } from 'express';
import * as friendService from '../services/friendService';
import { FriendRequestStatus, IFriendRequest } from '../models/friendRequest';

interface SendRequestDTO {
  recipientId: string;
}

interface RespondDTO {
  requestId: string;
  accept: boolean;
}

/**
 * POST /api/friends/requests
 * Send a friend request
 */
export const sendRequest: RequestHandler<{}, IFriendRequest | { message: string }, SendRequestDTO> = async (req, res, next) => {
  try {
    // @ts-ignore
    const requesterId: string = req.user.id;
    const { recipientId } = req.body;
    if (!recipientId) {
      res.status(400).json({ message: 'recipientId is required' });
      return;
    }
    const request = await friendService.sendRequest(requesterId, recipientId);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/friends/requests/:requestId
 * Accept or reject a friend request
 */
export const respondRequest: RequestHandler<{ requestId: string }, IFriendRequest, RespondDTO> = async (req, res, next) => {
  try {
    // @ts-ignore
    const userId: string = req.user.id;
    const { requestId } = req.params;
    const { accept } = req.body;
    const result = await friendService.respondRequest(requestId, userId, accept);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends/requests/received
 * List incoming friend requests
 */
export const listReceived: RequestHandler<{}, IFriendRequest[]> = async (req, res, next) => {
  try {
    // @ts-ignore
    const userId: string = req.user.id;
    const list = await friendService.listReceived(userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/friends/requests/sent
 * List outgoing friend requests
 */
export const listSent: RequestHandler<{}, IFriendRequest[]> = async (req, res, next) => {
  try {
    // @ts-ignore
    const userId: string = req.user.id;
    const list = await friendService.listSent(userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
};


/**
 * GET /api/friends
 * List confirmed friends
 */ 
export const listFriends: RequestHandler<{}, Array<{
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  since: Date;
}>> = async (req, res, next) => {
  try {
    // @ts-ignore
    const userId: string = req.user.id;
    const list = await friendService.listFriends(userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}