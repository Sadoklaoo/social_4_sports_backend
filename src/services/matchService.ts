// src/services/matchService.ts
import Match, { IMatch } from '../models/Match';

export const createMatch = async (data: Partial<IMatch>, playerId: string): Promise<IMatch> => {
  return Match.create({ ...data, player: playerId });
};

export const getMatchHistory = async (playerId: string): Promise<IMatch[]> => {
  return Match.find({ player: playerId })
    .sort({ date: -1 })
    .populate('opponent', 'email skillLevel')
    .exec();
};
