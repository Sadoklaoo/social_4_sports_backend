// src/initDatabase.ts

import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import Match from '../models/Match';
import Message from '../models/Message';

const SALT_ROUNDS = 10;

export async function initializeDatabase(): Promise<void> {
  // 1) Build all defined indexes on your models:
  //    This ensures your `2dsphere`, `unique` and other indexes exist.
  await Promise.all([
    User.init(),
    Match.init(),
    Message.init(),
    // …any other Model.init() calls
  ]);

  // 2) Seed any essential data—for example, a default admin user.
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'supersecret';
  const existingAdmin = await User.findOne({ email: adminEmail }).exec();
  if (!existingAdmin) {
    console.log('🛠  Seeding default admin user');
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);
    const adminData: Partial<IUser> = {
      fullName: 'Admin User',
      email: adminEmail,
      passwordHash,
      skillLevel: 'pro',
      avatar: '1.png',
      location: { type: 'Point', coordinates: [0, 0] },
    };
    await User.create(adminData);
    console.log(`🛠  Created admin user: ${adminEmail}`);
  }
  
  console.log('✅ Database initialization complete');
}
