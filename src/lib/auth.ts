import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../types';
import { initialUsers } from './seed-data';
import { getSigningSecret } from './auth/signing-secret';


export interface TokenPayload {
  user_id: number;
  email: string;
  full_name: string;
  role: UserRole;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSigningSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getSigningSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export function getUserFromToken(authHeader?: string | null): TokenPayload | null {
  if (!authHeader) return null;
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  return verifyToken(token);
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  if (userRole === 'admin') return true; // Admin has superuser access
  return allowedRoles.includes(userRole);
}

