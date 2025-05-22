// src/config/queues.ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    connectionName: 'bullmq',
    });


export const pushQueue = new Queue('push', { connection });
export const notificationQueue = new Queue('notification', { connection });