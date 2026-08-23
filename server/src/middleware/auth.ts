import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt.js';
import { AppError } from '../lib/AppError.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractUser(req: Request, cookieName: string): JwtPayload | null {
  const token: string | undefined = req.cookies[cookieName];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const user = extractUser(req, 'token');
  if (!user) return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
  req.user = user;
  next();
}

// Admin sessions use their own cookie ('admin_token') so admin and customer
// logins don't stomp on each other's session in the same browser.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = extractUser(req, 'admin_token');
  if (!user) return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
  if (user.role !== 'admin') return next(new AppError(403, 'Admin access required', 'FORBIDDEN'));
  req.user = user;
  next();
}
