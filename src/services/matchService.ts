import Match, { IMatch, MatchStatus } from '../models/Match';
import { Types } from 'mongoose';

export interface ScheduleMatchInput {
  opponent: string;
  location: string;
  scheduledFor: Date;
}

export const scheduleMatch = async (
  userId: string,
  data: ScheduleMatchInput
): Promise<IMatch> => {
  // Prevent self-scheduling
  if (data.opponent === userId) {
    throw new Error("You can't schedule a match with yourself");
  }
  return Match.create({
    initiator: new Types.ObjectId(userId),
    opponent:  new Types.ObjectId(data.opponent),
    location:  data.location,
    scheduledFor: data.scheduledFor,
    status: 'AwaitingConfirmation',
  });
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
  // Only opponent may confirm
  const match = await Match.findById(matchId).exec();
  if (!match || match.opponent.toString() !== userId) return null;
  if (match.status !== 'AwaitingConfirmation') return match;
  match.status = 'Confirmed';
  return match.save();
};

export const cancelMatch = async (
  matchId: string,
  userId: string
): Promise<IMatch | null> => {
  // Either side can cancel if not completed
  const match = await Match.findById(matchId).exec();
  if (!match) return null;
  if (match.initiator.toString() !== userId && match.opponent.toString() !== userId) {
    throw new Error('Not authorized');
  }
  if (match.status === 'Completed') {
    throw new Error('Cannot cancel a completed match');
  }
  match.status = 'Cancelled';
  return match.save();
};

export const rescheduleMatch = async (
  matchId: string,
  userId: string,
  newDate: Date
): Promise<IMatch | null> => {
  // Only initiator may reschedule
  const match = await Match.findById(matchId).exec();
  if (!match || match.initiator.toString() !== userId) return null;
  if (match.status === 'Completed' || match.status === 'Cancelled') {
    throw new Error('Cannot reschedule this match');
  }
  match.scheduledFor = newDate;
  match.status = 'AwaitingConfirmation'; // need fresh confirmation
  return match.save();
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
  if (match.status !== 'Confirmed') {
    throw new Error('Only confirmed matches can be completed');
  }
  match.score  = data.score;
  match.result = data.result;
  match.status = 'Completed';
  return match.save();
};