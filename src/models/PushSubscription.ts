import { Schema, model, Types, Document } from 'mongoose';

export interface IPushSubscription extends Document {
  user: Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth:   string;
  };
}

const subSchema = new Schema<IPushSubscription>({
  user:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endpoint: { type: String, required: true },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
});

subSchema.index({ user: 1 });
export default model<IPushSubscription>('PushSubscription', subSchema);
