// scripts/seedPushSub.cjs
require('dotenv').config();
const mongoose = require('mongoose');
const PushSubscription = require('../src/models/PushSubscription').default;

// Replace with a real user ID and a valid browser‐generated subscription
const USER_ID  = '6828a6f0e8a2e085bdef6de5';
const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abcdef...';
const P256DH   = 'BOr2...validBase64Url...';
const AUTH     = 'abc123...';

async function main() {
  try {
    // 1) Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // 2) Create one subscription
    const doc = await PushSubscription.create({
      user:     USER_ID,
      endpoint: ENDPOINT,
      keys: {
        p256dh: P256DH,
        auth:   AUTH
      }
    });
    console.log('🌱 Seeded subscription with _id =', doc._id);

  } catch (err) {
    console.error('❌ Error seeding subscription:', err);
  } finally {
    // 3) Disconnect
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
