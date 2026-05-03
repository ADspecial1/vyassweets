import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../lib/AppError.js';

type SchemaMap = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

function setProp(req: Request, key: 'query' | 'params', value: unknown): void {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

export function validate(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
      if (schemas.query) setProp(req, 'query', schemas.query.parse(req.query));
      if (schemas.params) setProp(req, 'params', schemas.params.parse(req.params));
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(new AppError(400, 'Validation failed', 'VALIDATION_ERROR', err.issues));
        return;
      }
      next(err);
    }
  };
}
