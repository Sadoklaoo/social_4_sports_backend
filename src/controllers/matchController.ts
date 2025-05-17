// src/controllers/matchController.ts
import { RequestHandler } from 'express';
import * as matchService from '../services/matchService';

/**
 * DTO for scheduling a match
 */
interface ScheduleMatchDTO {
  opponent: string;              // opponent’s userId
  location: string;              // e.g. “Community Center”
  scheduledFor: string;          // ISO date-time string
}

/**
 * POST /api/matches
 */
export const scheduleMatch: RequestHandler<{}, {}, ScheduleMatchDTO> = async (req, res, next) => {
  try {
    const { opponent, location, scheduledFor } = req.body;

    // basic validation
    if (!opponent || !location || !scheduledFor) {
      res.status(400).json({ message: 'Missing opponent, location or scheduledFor' });
      return;
    }

    const match = await matchService.scheduleMatch(
      // @ts-ignore: user injected by auth middleware
      req.user.id,
      {
        opponent,
        location,
        scheduledFor: new Date(scheduledFor),
      }
    );
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/matches/upcoming
 */
export const getUpcomingMatches: RequestHandler = async (req, res, next) => {
  try {
    const list = await matchService.getUpcomingMatches(
      // @ts-ignore
      req.user.id
    );
    res.json(list);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/matches/:id/confirm
 */
export const confirmMatch: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const updated = await matchService.confirmMatch(
      req.params.id,
      // @ts-ignore
      req.user.id
    );
    if (!updated) {
      res.status(404).json({ message: 'Match not found or not allowed' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/matches/:id/reschedule
 */
interface RescheduleDTO {
  scheduledFor: string;
}

export const rescheduleMatch: RequestHandler<{ id: string }, {}, RescheduleDTO> = async (
  req,
  res,
  next
) => {
  try {
    const { scheduledFor } = req.body;
    if (!scheduledFor) {
      res.status(400).json({ message: 'Missing scheduledFor date' });
      return;
    }

    const updated = await matchService.rescheduleMatch(
      req.params.id,
      // @ts-ignore
      req.user.id,
      new Date(scheduledFor)
    );
    if (!updated) {
      res.status(404).json({ message: 'Match not found or not allowed' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * DELETE /api/matches/:id
 */
export const cancelMatch: RequestHandler<{ id: string }> = async (req, res, next) => {
  try {
    const updated = await matchService.cancelMatch(
      req.params.id,
      // @ts-ignore
      req.user.id
    );
    if (!updated) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    res.json({ message: 'Match cancelled', match: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * GET /api/matches/history
 */
export const getMatchHistory: RequestHandler = async (req, res, next) => {
  try {
    const history = await matchService.getMatchHistory(
      // @ts-ignore
      req.user.id
    );
    res.json(history);
  } catch (err) {
    next(err);
  }
};


interface CompleteMatchDTO {
  score: string[];
  result: 'Win' | 'Loss';
}

/**
 * PUT /api/matches/:id/complete
 */
export const completeMatch: RequestHandler<{ id: string }, {}, CompleteMatchDTO> = 
  async (req, res, next) => {
  try {
    const { score, result } = req.body;
    if (!Array.isArray(score) || !result) {
      res.status(400).json({ message: 'Must provide score array and result' });
      return;
    }

    const updated = await matchService.completeMatch(
      req.params.id,
      // @ts-ignore
      req.user.id,
      { score, result }
    );

    if (!updated) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};