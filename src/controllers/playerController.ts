// src/controllers/playerController.ts
import { RequestHandler } from 'express';
import * as playerService from '../services/playerService';
import { IUser } from '../models/User';

/**
 * Expected query parameters for searching players
 */
interface QueryParams {
  skillLevel?: 'beginner' | 'intermediate' | 'pro';
  lat: string;
  lng: string;
  radius?: string;
}

/**
 * GET /api/players/search
 * Search for players by skill level and proximity
 */
export const searchPlayers: RequestHandler<{}, IUser[], {}, QueryParams> =
  async (req, res, next) => {
    try {
      const { skillLevel, lat, lng, radius } = req.query;
      if (!lat || !lng) {
        res.status(400).json([]);
        return;   // end here, no returned value
      }

      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      if (isNaN(latitude) || isNaN(longitude)) {
        res.status(400).json([]);
        return;   // end here as well
      }
      // @ts-ignore
      const userId: string = req.user.id;

      const players = await playerService.searchPlayers({
        skillLevel,
        latitude,
        longitude,
        maxDistanceMeters: radius ? parseInt(radius, 10) : undefined,
      }, userId );

      res.json(players);
      return;     // final end, handler returns void
    } catch (error) {
      next(error);
      return;     // end after calling next()
    }
  };