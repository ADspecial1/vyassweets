import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { verifyWebhookSignature } from '../services/razorpay.js';
import { AppError } from '../lib/AppError.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Raw body parser applied at route level — router mounted BEFORE express.json() in server.ts
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string | undefined;
      if (!signature) throw new AppError(400, 'Missing x-razorpay-signature header');

      const rawBody = (req.body as Buffer).toString();
      if (!verifyWebhookSignature(rawBody, signature)) throw new AppError(400, 'Invalid webhook signature');

      const event = JSON.parse(rawBody) as {
        event: string;
        payload?: { payment?: { entity?: Record<string, unknown> } };
      };
      const paymentEntity = event.payload?.payment?.entity;

      if (!paymentEntity) {
        res.json({ ok: true });
        return;
      }

      const razorpayPaymentId = paymentEntity.id as string;
      const razorpayOrderId = paymentEntity.order_id as string;

      if (event.event === 'payment.captured') {
        const order = await Order.findOne({ 'payment.razorpayOrderId': razorpayOrderId });
        if (!order || order.payment?.status === 'paid') {
          res.json({ ok: true });
          return;
        }

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.qty } });
        }
        if (order.couponCode) {
          await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
        }

        order.status = 'paid';
        if (order.payment) {
          order.payment.razorpayPaymentId = razorpayPaymentId;
          order.payment.status = 'paid';
          order.payment.paidAt = new Date();
        }
        await order.save();
        logger.info({ orderId: order._id, razorpayPaymentId }, 'payment.captured via webhook');
      } else if (event.event === 'payment.failed') {
        await Order.findOneAndUpdate(
          { 'payment.razorpayOrderId': razorpayOrderId, 'payment.status': 'created' },
          { 'payment.status': 'failed', status: 'cancelled' },
        );
        logger.info({ razorpayOrderId }, 'payment.failed via webhook');
      }

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
