import type { Response } from 'express';
import { env } from '../config/env.js';

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const isProd = env.NODE_ENV === 'production';

export function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(isProd && { domain: env.COOKIE_DOMAIN }),
    maxAge: SEVEN_DAYS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(isProd && { domain: env.COOKIE_DOMAIN }),
  });
}

// Separate cookie name so an admin login in one tab never clears a customer
// session (or vice versa) — they're independent cookies on the same domain.
export function setAdminAuthCookie(res: Response, token: string): void {
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(isProd && { domain: env.COOKIE_DOMAIN }),
    maxAge: SEVEN_DAYS,
  });
}

export function clearAdminAuthCookie(res: Response): void {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    ...(isProd && { domain: env.COOKIE_DOMAIN }),
  });
}
