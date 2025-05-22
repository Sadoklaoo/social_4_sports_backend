// src/workers/pushWorker.ts
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

import PushSubscription from '../models/PushSubscription';
import webpush from 'web-push';
console.log('🚀 Push worker starting up...');
// 1) Redis connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null});

// 2) Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,       // e.g. "mailto:you@example.com"
  process.env.VAPID_PUBLIC_KEY!,    // from your generated VAPID keys
  process.env.VAPID_PRIVATE_KEY!
);

// 3) Create the worker
const worker = new Worker(
  'push',
  async job => {
    const { notificationId, recipient, type, payload } = job.data as {
      notificationId: string;
      recipient:      string;
      type:           string;
      payload:        any;
    };

    // 4) Load all subscriptions for this user
    const subs = await PushSubscription.find({ user: recipient }).lean();
    if (subs.length === 0) return;  // no clients to notify

    // 5) Build notification title/body
    let title = 'New notification';
    let body  = '';
    switch (type) {
      case 'FriendRequest':
        title = 'New Friend Request';
        body  = `You have a friend request`;
        break;
      case 'MatchInvite':
        title = 'Match Invitation';
        body  = `Match scheduled for ${new Date(payload.scheduledFor).toLocaleString()}`;
        break;
      case 'MatchInviteAccepted':
        title = 'Match Confirmed';
        body  = `Your match (${payload.matchId}) was confirmed`;
        break;
      case 'MatchRescheduled':
        title = 'Match Rescheduled';
        body  = `Match rescheduled for ${new Date(payload.newScheduledFor).toLocaleString()}`;
        break;
      case 'MatchCompleted':
        title = 'Match Completed';
        body  = `Your match (${payload.matchId}) is now complete. You can leave a review.`;
        break;
      case 'MatchCancelled':
        title = 'Match Cancelled';
        body  = `Your match (${payload.matchId}) was cancelled.`;
        break;
      case 'Message':
        title = 'New Message';
        body  = payload.preview;
        break;
      default:
        body = `You have a new ${type} notification`;
    }

    // 6) Create the push payload
    const pushPayload = JSON.stringify({
      title,
      body,
      data: { notificationId, type, payload }
    });

    // 7) Send to each subscription
    await Promise.all(
      subs.map(sub =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          pushPayload
        ).catch((err: any) => {
          // Clean up expired subscriptions
          if (err.statusCode === 404 || err.statusCode === 410) {
            return PushSubscription.deleteOne({ _id: sub._id }).exec();
          }
          console.error('Push send error:', err);
        })
      )
    );
  },
  { connection }
);

// 8) Log worker events
worker.on('completed', job => {
  console.log(`Push job ${job.id} completed`);
});
worker.on('failed', (job, err) => {
  console.error(`Push job ${job?.id} failed:`, err);
});
worker.on('error', err => {
  console.error('Push worker error:', err);
});