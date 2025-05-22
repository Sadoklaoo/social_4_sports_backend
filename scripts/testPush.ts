// scripts/testPush.ts
import mongoose from 'mongoose';
import webpush from 'web-push';
import dotenv from 'dotenv';
import PushSubscription, { IPushSubscription } from '../src/models/PushSubscription';

dotenv.config();

// 1) Configure VAPID (must match your .env)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

async function main() {
  // 2) Connect to Mongo (no useNewUrlParser / useUnifiedTopology)
  await mongoose.connect(process.env.MONGODB_URI!);

  // 3) Fetch all subscriptions (or filter to a specific user)
  const subs: IPushSubscription[] = await PushSubscription.find({ /* e.g. user: '<userId>' */ }).lean();

  if (subs.length === 0) {
    console.log('No push subscriptions found.');
    process.exit(0);
  }

  // 4) Build a test payload
  const payload = JSON.stringify({
    title: 'Test Notification',
    body:  'If you see this, your push setup is working!',
    data:  { test: true }
  });

  // 5) Send to each subscription
  await Promise.all(subs.map(sub =>
    webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      payload
    ).then(() => console.log(`✔️ Sent to ${sub.endpoint}`))
     .catch(err => {
       console.error(`❌ Failed for ${sub.endpoint}:`, err);
       // auto-cleanup on 404 or 410
       if (err.statusCode === 404 || err.statusCode === 410) {
         return PushSubscription.deleteOne({ _id: sub._id }).exec();
       }
     })
  ));

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
