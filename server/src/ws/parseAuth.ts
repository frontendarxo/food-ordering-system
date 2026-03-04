import type { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';

export interface WsUser {
  userId: string;
  role: 'admin' | 'worker';
  location?: 'шатой' | 'гикало';
}

function parseCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/\baccessToken=([^;]+)/);
  return match ? match[1].trim() : null;
}

export function getWsUser(req: IncomingMessage): WsUser | null {
  const token = parseCookie(req.headers.cookie);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'admin' | 'worker'; location?: 'шатой' | 'гикало' };
    return { userId: decoded.userId, role: decoded.role, location: decoded.location };
  } catch {
    return null;
  }
}
