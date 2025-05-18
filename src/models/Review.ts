import { Schema, model, Document, Types } from 'mongoose';

/**
 * Review document interface
 */
export interface IReview extends Document {
  match: Types.ObjectId;
  reviewer: Types.ObjectId;
  reviewee: Types.ObjectId;
  rating: number;            // e.g., 1-5 stars
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Review schema for post-match feedback
 * @openapi
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         match:
 *           type: string
 *         reviewer:
 *           type: string
 *         reviewee:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         comment:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const reviewSchema = new Schema<IReview>(
  {
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true }
  },
  { timestamps: true }
);

// Prevent duplicate review per match per reviewer
reviewSchema.index({ match: 1, reviewer: 1 }, { unique: true });

export default model<IReview>('Review', reviewSchema);
