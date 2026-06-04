import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import User from '../models/User.js';
import { signToken } from '../lib/jwt.js';
import { setAuthCookie, clearAuthCookie } from '../lib/cookies.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../lib/AppError.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: { message: 'Too many login attempts, try again in a minute', code: 'RATE_LIMITED' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { message: 'Too many requests, try again in a minute', code: 'RATE_LIMITED' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  '/register',
  registerLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body as z.infer<typeof registerSchema>;

    const existing = await User.findOne({ email });
    if (existing) throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, phone, passwordHash });

    const token = signToken({ userId: String(user._id), role: user.role });
    setAuthCookie(res, token);

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  }),
);

router.post(
  '/login',
  loginLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as z.infer<typeof loginSchema>;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');

    const token = signToken({ userId: String(user._id), role: user.role });
    setAuthCookie(res, token);

    res.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  }),
);

router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new AppError(404, 'User not found', 'NOT_FOUND');
    res.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, addresses: user.addresses },
    });
  }),
);

export default router;
