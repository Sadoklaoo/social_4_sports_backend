import Match, { IMatch } from '../models/Match';
import { Types } from 'mongoose';
import * as notifService from './notificationService';
import { io } from '../server';
export interface ScheduleMatchInput {
  opponent: string;
  location: string;
  scheduledFor: Date;
}

export const scheduleMatch = async (
  userId: string,
  data: ScheduleMatchInput
): Promise<IMatch> => {
  if (data.opponent === userId) {
    throw new Error("You can't schedule a match with yourself");
  }
  const match = await Match.create({
    initiator:   new Types.ObjectId(userId),
    opponent:    new Types.ObjectId(data.opponent),
    location:    data.location,
    score:       [],
    result:      null,
    createdAt:   new Date(),
    updatedAt:   new Date(),
    completedAt: null,
    status:      'AwaitingConfirmation',
    scheduledFor: data.scheduledFor,
  });

  // — Notify opponent —
  try {
    const notif = await notifService.createNotification({
      recipient: data.opponent,
      actor:     userId,
      type:      'MatchInvite',
      payload:   { matchId: match.id, scheduledFor: match.scheduledFor }
    });
    io.to(`user:${data.opponent}`).emit('notification', notif);
  } catch (err) {
    console.error('Notification error (scheduleMatch):', err);
  }

  return match;
};


export const getUpcomingMatches = async (
  userId: string
): Promise<IMatch[]> => {
  return Match.find({
    $or: [
      { initiator: userId },
      { opponent: userId }
    ],
    status: { $in: ['AwaitingConfirmation','Confirmed'] },
    scheduledFor: { $gte: new Date() }
  })
    .sort({ scheduledFor: 1 })
    .populate('opponent','email avatar skillLevel')
    .populate('initiator','email avatar skillLevel')
    .exec();
};

export const confirmMatch = async (
  matchId: string,
  userId: string
): Promise<IMatch | null> => {
  const match = await Match.findById(matchId).exec();
  if (!match || match.opponent.toString() !== userId) return null;
  if (match.status !== 'AwaitingConfirmation') return match;

  match.status = 'Confirmed';
  const saved = await match.save();

  // Notify initiator that invite (or re-invite) was accepted,
  // including scheduledFor so the client sees which date was confirmed.
  try {
    const notif = await notifService.createNotification({
      recipient: match.initiator.toString(),
      actor:     userId,
      type:      'MatchInviteAccepted',
      payload:   { matchId: saved.id, scheduledFor: saved.scheduledFor }
    });
    io.to(`user:${match.initiator.toString()}`).emit('notification', notif);
  } catch (err) {
    console.error('Notification error (confirmMatch):', err);
  }

  return saved;
};

export const cancelMatch = async (
  matchId: string,
  userId: string
): Promise<IMatch | null> => {
  const match = await Match.findById(matchId).exec();
  if (!match) return null;
  if (
    match.initiator.toString() !== userId &&
    match.opponent.toString()  !== userId
  ) {
    throw new Error('Not authorized');
  }
  if (match.status === 'Completed') {
    throw new Error('Cannot cancel a completed match');
  }

  // Was this a confirmed match? If so, we treat this as a decline.
  const wasConfirmed = match.status === 'Confirmed';

  // Update status and save
  match.status = 'Cancelled';
  const saved = await match.save();

  // If it was confirmed, notify the other party that it’s been declined
  if (wasConfirmed) {
    const otherId =
      match.initiator.toString() === userId
        ? match.opponent.toString()
        : match.initiator.toString();

    try {
      const notif = await notifService.createNotification({
        recipient: otherId,
        actor:     userId,
        type:      'MatchCancelled',
        payload:   { matchId: saved.id }
      });
      io.to(`user:${otherId}`).emit('notification', notif);
    } catch (err) {
      console.error('Notification error (cancelMatch decline):', err);
    }
  }

  return saved;
};

/**
 * Initiator reschedules a confirmed or awaiting match
 */
export const rescheduleMatch = async (
  matchId: string,
  userId: string,
  newDate: Date
): Promise<IMatch | null> => {
  const match = await Match.findById(matchId).exec();
  if (!match || match.initiator.toString() !== userId) return null;
  if (["Completed", "Cancelled"].includes(match.status)) {
    throw new Error('Cannot reschedule this match');
  }

  match.scheduledFor = newDate;
  match.status = "AwaitingConfirmation";
  const saved = await match.save();

  // Notify opponent of reschedule
  try {
    const opponentId = match.opponent.toString();
    const notif = await notifService.createNotification({
      recipient: opponentId,
      actor:     userId,
      type:      'MatchRescheduled',        // reuse invite type or define 'MatchRescheduled'
      payload:   { matchId: saved.id, newScheduledFor: saved.scheduledFor }
    });
    io.to(`user:${opponentId}`).emit('notification', notif);
  } catch (err) {
    console.error('Notification error (rescheduleMatch):', err);
  }

  return saved;
};

export const getMatchHistory = async (
  userId: string
): Promise<IMatch[]> => {
  return Match.find({
    $or: [
      { initiator: userId },
      { opponent: userId }
    ],
    status: 'Completed'
  })
    .sort({ scheduledFor: -1 })
    .populate('opponent','email avatar skillLevel')
    .populate('initiator','email avatar skillLevel')
    .exec();
};

export interface CompleteMatchInput {
  score: string[];           // e.g. ["11-9","9-11","11-7"]
  result: 'Win' | 'Loss';    // from the point of view of the initiator
}

/**
 * Mark a match as completed, recording score & result.
 * Only the initiator may call this on a confirmed match.
 */
export const completeMatch = async (
  matchId: string,
  userId: string,
  data: CompleteMatchInput
): Promise<IMatch | null> => {
  const match = await Match.findById(matchId).exec();
  if (!match) return null;
  if (match.initiator.toString() !== userId) {
    throw new Error('Only the initiator can complete the match');
  }
  if (match.status !== "Confirmed") {
    throw new Error('Only confirmed matches can be completed');
  }

  match.score  = data.score;
  match.result = data.result;
  match.status = "Completed";
  const saved = await match.save();

  // Notify opponent that match is completed and ready for review
  try {
    const opponentId = match.opponent.toString();
    const notif = await notifService.createNotification({
      recipient: opponentId,
      actor:     userId,
      type:      'MatchCompleted',
      payload:   { matchId: saved.id }
    });
    io.to(`user:${opponentId}`).emit('notification', notif);
  } catch (err) {
    console.error('Notification error (completeMatch):', err);
  }

  return saved;
};