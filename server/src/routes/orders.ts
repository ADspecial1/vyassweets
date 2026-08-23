import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/AppError.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { verifyPaymentSignature } from '../services/razorpay.js';
import { orderService } from '../lib/serviceClient.js';

const router = Router();

const createSchema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  couponCode: z.string().optional(),
  addressId: z.string(),
});

const verifySchema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

// POST /api/orders/create
// Monolith handles auth + validation, then delegates order creation to order-service.
// order-service recomputes all prices from DB — client-side prices are never trusted.
router.post(
  '/create',
  requireAuth,
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const result = await orderService.create(req.user!.userId, req.body);
    res.status(201).json(result);
  }),
);

// POST /api/orders/verify
router.post(
  '/verify',
  requireAuth,
  validate({ body: verifySchema }),
  asyncHandler(async (req, res) => {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body as z.infer<typeof verifySchema>;

    const valid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!valid) throw new AppError(400, 'Invalid payment signature');

    const order = await Order.findById(orderId);
    if (!order) throw new AppError(404, 'Order not found');
    if (order.userId.toString() !== req.user!.userId) throw new AppError(403, 'Forbidden');

    // Idempotent — already paid
    if (order.payment?.status === 'paid') {
      res.json({ order });
      return;
    }

    if (order.payment?.razorpayOrderId !== razorpayOrderId) throw new AppError(400, 'Order ID mismatch');

    // Decrement stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
    }

    // Increment coupon usedCount
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    order.status = 'paid';
    if (order.payment) {
      order.payment.razorpayPaymentId = razorpayPaymentId;
      order.payment.razorpaySignature = razorpaySignature;
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }
    await order.save();

    res.json({ order });
  }),
);

// GET /api/orders — own orders list
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    // Pending orders are abandoned/incomplete checkouts (Razorpay never confirmed) —
    // don't clutter the customer's list with them.
    const orders = await Order.find({ userId: req.user!.userId, status: { $ne: 'pending' } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  }),
);

// GET /api/orders/:id — own order detail
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).lean();
    if (!order) throw new AppError(404, 'Order not found');
    if (order.userId.toString() !== req.user!.userId) throw new AppError(403, 'Forbidden');
    res.json(order);
  }),
);

export default router;
