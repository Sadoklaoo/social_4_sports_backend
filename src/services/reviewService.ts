import Review, { IReview } from '../models/review';
import { Types } from 'mongoose';

export interface CreateReviewInput {
  matchId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

/**
 * Create a new review for a match
 */
export const createReview = async (
  data: CreateReviewInput
): Promise<IReview> => {
  const { matchId, reviewerId, revieweeId, rating, comment } = data;
  if (rating < 1 || rating > 5) {
    throw Object.assign(new Error('Rating must be between 1 and 5'), { status: 400 });
  }
  try {
    const review = await Review.create({
      match: new Types.ObjectId(matchId),
      reviewer: new Types.ObjectId(reviewerId),
      reviewee: new Types.ObjectId(revieweeId),
      rating,
      comment,
    });
    return review;
  } catch (err: any) {
    if (err.code === 11000) {
      throw Object.assign(new Error('Review already exists for this match by this reviewer'), { status: 409 });
    }
    throw err;
  }
};

/**
 * List reviews for a given match
 */
export const listReviewsByMatch = async (
  matchId: string
): Promise<IReview[]> => {
  return Review.find({ match: new Types.ObjectId(matchId) })
    .populate('reviewer', 'fullName email avatar')
    .populate('reviewee', 'fullName email avatar')
    .exec();
};
