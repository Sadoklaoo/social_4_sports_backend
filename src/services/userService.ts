// src/services/userService.ts
import Match from '../models/Match';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

export type CreateUserInput = {
  fullName: string;        // ← new
  email: string;
  passwordHash: string;
  avatar?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'pro';
  location: { type: 'Point'; coordinates: [number, number] };
};

export const createUser = async (data: CreateUserInput): Promise<IUser> => {
  const { fullName, email, passwordHash, avatar, skillLevel, location } = data;
  return User.create({ fullName, email, passwordHash, avatar, skillLevel, location });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  if (!Types.ObjectId.isValid(id)) return null;
  return User.findById(id).exec();
};

export const updateUser = async (
  id: string,
  data: Partial<IUser>
): Promise<IUser | null> => {
  if (!Types.ObjectId.isValid(id)) return null;
  return User.findByIdAndUpdate(id, data, { new: true }).exec();
};

export const deleteUser = async (id: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) return false;
  const res = await User.findByIdAndDelete(id).exec();
  return res != null;
};
export interface UserStats {
  matchesPlayed: number;
  winRate: number;
  averagePointsFor: string;      // avg points the user scored per set
  averagePointsAgainst: string;  // avg points the opponent scored per set
  longestStreak: number;
}

export const computeUserStats = async (userId: string): Promise<UserStats> => {
  // 1) fetch only completed matches
  const matches = await Match.find({
    status: 'Completed',
    $or: [{ initiator: userId }, { opponent: userId }],
  })
    .sort({ createdAt: 1 })
    .exec();

  const matchesPlayed = matches.length;

  // 2) count wins for winRate
  let wins = 0;
  matches.forEach(m => {
    const isInitiator = m.initiator.toString() === userId;
    const won =
      (isInitiator && m.result === 'Win') ||
      (!isInitiator && m.result === 'Loss');
    if (won) wins++;
  });
  const winRate =
    matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  // 3) sum up all points for/against and count sets
  let totalFor = 0;
  let totalAgainst = 0;
  let totalSets = 0;

  matches.forEach(m => {
    const isInitiator = m.initiator.toString() === userId;
    // each score entry is a string like "11-9"
    (m.score ?? []).forEach(setStr => {
      const parts = setStr.split('-');
      if (parts.length !== 2) return;
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      if (Number.isNaN(a) || Number.isNaN(b)) return;

      const userPts = isInitiator ? a : b;
      const oppPts = isInitiator ? b : a;

      totalFor += userPts;
      totalAgainst += oppPts;
      totalSets++;
    });
  });

  const averagePointsFor =
    totalSets > 0 ? (totalFor / totalSets).toFixed(2) : '0.00';
  const averagePointsAgainst =
    totalSets > 0 ? (totalAgainst / totalSets).toFixed(2) : '0.00';

  // 4) longest consecutive win streak
  let longestStreak = 0;
  let currentStreak = 0;
  matches.forEach(m => {
    const isInitiator = m.initiator.toString() === userId;
    const won =
      (isInitiator && m.result === 'Win') ||
      (!isInitiator && m.result === 'Loss');
    if (won) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });

  return {
    matchesPlayed,
    winRate,
    averagePointsFor,
    averagePointsAgainst,
    longestStreak,
  };
};
