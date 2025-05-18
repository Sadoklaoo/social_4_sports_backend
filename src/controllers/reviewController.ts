import { RequestHandler } from 'express';
import * as reviewService from '../services/reviewService';
import { IReview } from '../models/review';

interface CreateReviewDTO {
  matchId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

/**
 * POST /api/reviews
 * Create a new review for a match
 */
export const createReview: RequestHandler<{}, IReview | { message: string }, CreateReviewDTO> =
  async (req, res, next) => {
    try {
      // @ts-ignore: injected by auth middleware
      const reviewerId: string = req.user.id;
      const { matchId, revieweeId, rating, comment } = req.body;
      if (!matchId || !revieweeId || rating == null) {
        res.status(400).json({ message: 'matchId, revieweeId and rating are required' });
        return;
      }
      const review = await reviewService.createReview({
        matchId,
        reviewerId,
        revieweeId,
        rating,
        comment,
      });
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  };

/**
 * GET /api/reviews/match/:matchId
 * List all reviews for a given match
 */
export const listReviewsByMatch: RequestHandler<{ matchId: string }, IReview[]> =
  async (req, res, next) => {
    try {
      const { matchId } = req.params;
      const reviews = await reviewService.listReviewsByMatch(matchId);
      res.json(reviews);
    } catch (err) {
      next(err);
    }
  };
