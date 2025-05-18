// src/tests/db.test.ts
import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
jest.setTimeout(20_000);

const TEST_URI = process.env.MONGODB_URI_TEST;
if (!TEST_URI) {
  throw new Error('Please set MONGODB_URI_TEST in your environment');
}

describe('MongoDB in-memory test DB connectivity', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_URI, {} as ConnectOptions);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        await mongoose.connection.db.dropDatabase();
      } catch {
        // ignore errors (e.g. auth)
      }
    }
    await mongoose.disconnect();
  });

  it('should connect (readyState == 1)', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should respond to ping', async () => {
    const admin = mongoose.connection.db!.admin();
    const res = await admin.ping();
    expect(res).toHaveProperty('ok', 1);
  });
});
