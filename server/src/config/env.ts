import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const envCandidates = [
  process.env.NODE_ENV === 'production'
    ? '/etc/sweets-app/.env'
    : path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '.env.local'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  // Must be a plain number of seconds ("3600") or an ms-style timespan ("7d", "12h").
  // jwt.sign() throws on anything else — validate here so a bad value fails at boot,
  // not as a 500 on every login.
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^(\d+|\d+(ms|s|m|h|d|w|y))$/, 'JWT_EXPIRES_IN must look like "7d", "12h", or "3600"')
    .default('7d'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  CLIENT_ORIGIN: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
});

// dotenv turns `KEY=` into `""`, but zod `.default()` only fires on `undefined`.
// Drop blank values so defaulted vars fall back and required vars still fail loudly.
const cleanedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, v]) => v !== undefined && v.trim() !== ''),
);

const parsed = envSchema.safeParse(cleanedEnv);

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
  throw new Error(`Missing or invalid env vars: ${missing}`);
}

export const env = parsed.data;
