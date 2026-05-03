import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/AppError.js';
import { logger } from '../lib/logger.js';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  // Mongoose duplicate key
  const mongoErr = err as { name?: string; code?: number; keyPattern?: Record<string, unknown> };
  if (mongoErr.name === 'MongoServerError' && mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyPattern ?? {})[0] ?? 'field';
    res.status(409).json({ error: { message: `${field} already exists`, code: 'DUPLICATE_KEY' } });
    return;
  }

  // Log the real error with full context before sending the 500
  const log = (req as Request & { log?: typeof logger }).log ?? logger;
  log.error({ err, name: err.name, message: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({ error: { message: 'Internal server error' } });
}
