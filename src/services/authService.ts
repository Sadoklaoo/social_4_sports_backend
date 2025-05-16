// src/services/authService.ts
import User, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const SALT_ROUNDS = 10;
// Assert these are present so TS treats them as strings, not possibly undefined
const JWT_SECRET = process.env.JWT_SECRET!;         
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

export interface AuthTokens {
  accessToken: string;
}

// Extend the built-in JwtPayload so TS knows our custom fields are allowed
interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
}

export const signup = async (data: {
  email: string;
  password: string;
  avatar?: string;
  location: { type: 'Point'; coordinates: [number, number] };
  skillLevel?: 'beginner' | 'intermediate' | 'pro';
}): Promise<IUser> => {
  const existing = await User.findOne({ email: data.email }).exec();
  if (existing) {
    throw new Error('Email already in use');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  // We only pass the fields our schema expects
  const newUser = await User.create({
    email: data.email,
    passwordHash,
    avatar: data.avatar,
    location: data.location,
    skillLevel: data.skillLevel,
  } as Partial<IUser>);

  return newUser;
};

export const login = async (
  email: string,
  password: string
): Promise<AuthTokens> => {
  const user = await User.findOne({ email }).exec();
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Build a payload that matches JwtPayload
  const payload: TokenPayload = {
    id: user.id,
    email: user.email,
    // iat, exp, etc. will be set by jwt.sign()
  };

  // Now this matches the jwt.sign overload (payload: JwtPayload)
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  const accessToken = jwt.sign(payload, JWT_SECRET, options);

  return { accessToken };
};

export const verifyToken = (token: string): TokenPayload => {
  // jwt.verify returns string | JwtPayload, so we cast
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
