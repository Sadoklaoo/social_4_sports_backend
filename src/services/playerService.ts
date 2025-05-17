import { Types } from 'mongoose';
import User, { IUser } from '../models/User';

export interface SearchPlayersParams {
  skillLevel?: 'beginner'|'intermediate'|'pro';
  latitude: number;
  longitude: number;
  maxDistanceMeters?: number;
}

export const searchPlayers = async (params: SearchPlayersParams,excludeUserId?: string): Promise<IUser[]> => {
  const { skillLevel, latitude, longitude, maxDistanceMeters = 10000 } = params;

  const filter: any = {
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistanceMeters
      }
    }
  };

    // Optionally filter out the current user
  if (excludeUserId) {
    filter._id = { $ne: new Types.ObjectId(excludeUserId) };
  }
  if (skillLevel) filter.skillLevel = skillLevel;

  return User.find(filter)
    .select('fullName email avatar skillLevel location')
    .limit(50)
    .exec();
};
