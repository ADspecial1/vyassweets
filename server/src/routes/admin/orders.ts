import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import { validate } from '../../middleware/validate.js';
import Order from '../../models/Order.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  paid:   ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered'],
};

const router = Router();
router.use(requireAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const { status, page = '1', limit = '20', search = '' } = req.query as Record<string, string>;
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search.trim()) {
    filter.$or = [
      { orderNumber: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  res.json({ orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}));

router.patch(
  '/:id/status',
  validate({ body: z.object({ status: z.enum(['packed', 'shipped', 'delivered', 'cancelled']) }) }),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError(404, 'Order not found');

    const { status: newStatus } = req.body as { status: string };
    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new AppError(400, `Cannot transition order from '${order.status}' to '${newStatus}'`);
    }

    order.status = newStatus as typeof order.status;
    await order.save();
    res.json({ order });
  }),
);

export default router;
