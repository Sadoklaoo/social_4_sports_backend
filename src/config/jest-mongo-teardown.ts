import mongoose from "mongoose";

// jest-mongo-teardown.ts
export default async function globalTeardown() {
  const mongoServer = (global as any).__MONGO_SERVER__;
  await mongoose.disconnect();
  await mongoServer.stop();
}
