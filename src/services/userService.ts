// src/services/userService.ts
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

type CreateUserInput = Omit<IUser, '_id'>;

export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
  return User.create(data);
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
