import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/AppError.js';
import User from '../models/User.js';

const router = Router();
router.use(requireAuth);

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^\d{10}$/).optional(),
});

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().regex(/^\d{6}$/),
  isDefault: z.boolean().default(false),
});

router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user });
}));

router.patch('/me', validate({ body: updateMeSchema }), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user!.userId, req.body, { new: true });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user });
}));

router.post('/addresses', validate({ body: addressSchema }), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError(404, 'User not found');
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  res.json({ user });
}));

router.patch('/addresses/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError(404, 'User not found');
  const addr = user.addresses.find((a) => a._id.toString() === req.params['id']);
  if (!addr) throw new AppError(404, 'Address not found');
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  Object.assign(addr, req.body);
  await user.save();
  res.json({ user });
}));

router.delete('/addresses/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.userId);
  if (!user) throw new AppError(404, 'User not found');
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params['id']) as typeof user.addresses;
  await user.save();
  res.json({ user });
}));

export default router;
