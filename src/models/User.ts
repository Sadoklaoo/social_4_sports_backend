import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string; 
  email: string;
  passwordHash: string;
  avatar: string;
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
 *         fullName:
 *           type: string        # ← new
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *         skillLevel:
 *           type: string
 *           enum: [beginner, intermediate, pro]
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 */
const userSchema = new Schema<IUser>({
  fullName:    { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  avatar:      { type: String, default: 'https://example.com/default-avatar.png' },
  skillLevel:   { type: String, enum: ['beginner','intermediate','pro'], default: 'beginner' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  // …etc
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });  // for geo-queries

export default model<IUser>('User', userSchema);
