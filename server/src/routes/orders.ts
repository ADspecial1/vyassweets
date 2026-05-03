import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/AppError.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { calculateOrder } from '../services/pricing.js';
import { createRazorpayOrder, verifyPaymentSignature } from '../services/razorpay.js';
import { generateOrderNumber } from '../services/orderNumber.js';
import { env } from '../config/env.js';

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
router.post(
  '/create',
  requireAuth,
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const { items, couponCode, addressId } = req.body as z.infer<typeof createSchema>;

    const user = await User.findById(req.user!.userId).lean();
    if (!user) throw new AppError(401, 'User not found');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const address = (user.addresses as any[]).find((a) => a._id?.toString() === addressId);
    if (!address) throw new AppError(400, 'Address not found');

    const pricing = await calculateOrder({ items, couponCode });

    const orderNumber = await generateOrderNumber();
    const rpOrder = await createRazorpayOrder(pricing.total, orderNumber);

    const order = await Order.create({
      userId: req.user!.userId,
      orderNumber,
      items: pricing.items,
      subtotal: pricing.subtotal,
      couponCode: pricing.couponCode,
      couponDiscount: pricing.couponDiscount,
      shippingFee: pricing.shippingFee,
      gst: pricing.gst,
      total: pricing.total,
      address,
      status: 'pending',
      payment: {
        provider: 'razorpay',
        razorpayOrderId: rpOrder.id,
        status: 'created',
      },
    });

    res.json({ order, razorpayOrderId: rpOrder.id, key: env.RAZORPAY_KEY_ID, amount: pricing.total });
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
    const orders = await Order.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).lean();
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
