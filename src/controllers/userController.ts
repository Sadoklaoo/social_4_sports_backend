// src/controllers/userController.ts
import { RequestHandler } from 'express';
import * as userService from '../services/userService';


interface CreateUserDTO {
  email: string;
  passwordHash: string;
  avatar?: string;
  skillLevel: 'beginner' | 'intermediate' | 'pro';
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}


export const createUser: RequestHandler<{}, {}, CreateUserDTO> = async (req, res, next) => {
  try {
    const {
      email,
      passwordHash,
      avatar,
      skillLevel = 'beginner',        // default if omitted
      location,
    } = req.body;

    // Basic server-side guard
    if (!email || !passwordHash || !location?.coordinates) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const user = await userService.createUser({
      email,
      passwordHash,
      avatar,
      skillLevel,
      location,
    });

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const getUserById: RequestHandler = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser: RequestHandler = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    const success = await userService.deleteUser(req.params.id);
    if (!success) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
