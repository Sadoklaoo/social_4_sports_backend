// src/models/Match.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  player: Types.ObjectId;          // the user who owns this match
  opponent: Types.ObjectId;        // their opponent (also a User)
  location: string;                // e.g. "Community Center"
  date: Date;                      // when the match took place
  score: string[];                 // per-set scores, e.g. ["11-9","11-7","11-6"]
  result: 'Win' | 'Loss';          // match outcome
}

const matchSchema = new Schema<IMatch>(
  {
    player:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    opponent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    date:     { type: Date,   required: true },
    score:    { type: [String], required: true },
    result:   { type: String, enum: ['Win','Loss'], required: true },
  },
  { timestamps: true }
);

export default model<IMatch>('Match', matchSchema);
