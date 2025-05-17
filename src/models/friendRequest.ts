import { Schema, model, Document, Types } from 'mongoose';

export enum FriendRequestStatus {
  Pending = 'pending',
  Accepted = 'accepted',
  Rejected = 'rejected'
}
/**
 * @openapi
 * components:
 *   schemas:
 *     FriendRequest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         requester:
 *           $ref: '#/components/schemas/User'
 *         recipient:
 *           $ref: '#/components/schemas/User'
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export interface IFriendRequest extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(FriendRequestStatus), default: FriendRequestStatus.Pending },
  },
  { timestamps: true }
);

// Ensure one pending request per pair
friendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default model<IFriendRequest>('FriendRequest', friendRequestSchema);
