import { Schema, model, Document, Types } from 'mongoose';

export type MatchStatus =
  | 'AwaitingConfirmation'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

export interface IMatch extends Document {
  initiator: Types.ObjectId;       // who created the match
  opponent: Types.ObjectId;        // the other player
  location: string;                // e.g. "Community Center"
  scheduledFor: Date;              // when the match is set
  status: MatchStatus;             // current state
  score?: string[];                // only set once Completed
  result?: 'Win' | 'Loss';         // only set once Completed
}

const matchSchema = new Schema<IMatch>(
  {
    initiator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opponent:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location:  { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ['AwaitingConfirmation','Confirmed','Cancelled','Completed'],
      default: 'AwaitingConfirmation',
      required: true,
    },
    score:    { type: [String], default: [] },
    result:   { type: String, enum: ['Win','Loss'] },
  },
  { timestamps: true }
);

// Ensure indexes for querying upcoming and geo if needed
matchSchema.index({ scheduledFor: 1 });
export default model<IMatch>('Match', matchSchema);
