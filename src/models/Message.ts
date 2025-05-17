import { Schema, model, Document, Types } from 'mongoose';

/**
 * Message document interface
 */
export interface IMessage extends Document {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

/**
 * Message schema
 */
const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    readAt:    { type: Date },   
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries between two users, sorted by creation time
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

export default model<IMessage>('Message', messageSchema);
