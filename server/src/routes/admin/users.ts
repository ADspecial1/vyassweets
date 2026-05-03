import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { validate } from '../../middleware/validate.js';
import User from '../../models/User.js';
import Order from '../../models/Order.js';

const router = Router();
router.use(requireAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const { page = '1', limit = '20', search = '' } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = { role: 'user' };
  if (search.trim()) {
    filter.$or = [
      { name:  { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
      { phone: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) throw new AppError(404, 'User not found');

  const orders = await Order.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('orderNumber total status createdAt');

  res.json({ user, orders });
}));

router.patch(
  '/:id/role',
  validate({ body: z.object({ role: z.enum(['user', 'admin']) }) }),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) throw new AppError(404, 'User not found');
    user.role = (req.body as { role: 'user' | 'admin' }).role;
    await user.save();
    res.json({ user });
  }),
);

export default router;
