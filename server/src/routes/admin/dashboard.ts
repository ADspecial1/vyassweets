import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';

const router = Router();
router.use(requireAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const paidStatuses = ['paid', 'packed', 'shipped', 'delivered'] as const;

  const [todayStats, weekStats, monthStats, topProducts, lowStock, recentOrders] =
    await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: paidStatuses }, createdAt: { $gte: todayStart } } },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: paidStatuses }, createdAt: { $gte: weekStart } } },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: paidStatuses }, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: { $in: paidStatuses }, createdAt: { $gte: thirtyDaysAgo } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', name: { $first: '$items.name' }, qty: { $sum: '$items.qty' } } },
        { $sort: { qty: -1 } },
        { $limit: 5 },
        { $project: { _id: 0, name: 1, qty: 1 } },
      ]),
      Product.find({ active: true, stock: { $lt: 10 } })
        .select('name stock _id')
        .sort({ stock: 1 })
        .limit(10),
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber total status createdAt userId'),
    ]);

  res.json({
    today:  { orders: todayStats[0]?.orders  ?? 0, revenue: todayStats[0]?.revenue  ?? 0 },
    week:   { orders: weekStats[0]?.orders   ?? 0, revenue: weekStats[0]?.revenue   ?? 0 },
    month:  { orders: monthStats[0]?.orders  ?? 0, revenue: monthStats[0]?.revenue  ?? 0 },
    topProducts,
    lowStock,
    recentOrders,
  });
}));

export default router;
