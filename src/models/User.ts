import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  skillLevel: string;
  location: { type: string; coordinates: [number, number] };
  // …other fields
}
/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         email:
 *           type: string
 *         skillLevel:
 *           type: string
 */
const userSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  skillLevel:   { type: String, enum: ['beginner','intermediate','pro'], default: 'beginner' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  // …etc
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });  // for geo-queries

export default model<IUser>('User', userSchema);
