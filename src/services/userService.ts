// src/services/userService.ts
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

export type CreateUserInput = {
  fullName: string;        // ← new
  email: string;
  passwordHash: string;
  avatar?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'pro';
  location: { type: 'Point'; coordinates: [number, number] };
};

export const createUser = async (data: CreateUserInput): Promise<IUser> => {
  const { fullName, email, passwordHash, avatar, skillLevel, location } = data;
  return User.create({ fullName, email, passwordHash, avatar, skillLevel, location });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
  if (!Types.ObjectId.isValid(id)) return null;
  return User.findById(id).exec();
};

export const updateUser = async (
  id: string,
  data: Partial<IUser>
): Promise<IUser | null> => {
  if (!Types.ObjectId.isValid(id)) return null;
  return User.findByIdAndUpdate(id, data, { new: true }).exec();
};

export const deleteUser = async (id: string): Promise<boolean> => {
  if (!Types.ObjectId.isValid(id)) return false;
  const res = await User.findByIdAndDelete(id).exec();
  return res != null;
};
