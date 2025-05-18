// jest-mongo-setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export default async function globalSetup() {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI_TEST = mongoServer.getUri();
  // expose stop function in global so teardown can stop it…
  (global as any).__MONGO_SERVER__ = mongoServer;
}