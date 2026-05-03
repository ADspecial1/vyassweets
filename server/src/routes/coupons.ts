import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import Coupon from '../models/Coupon.js';

const router = Router();

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
});

router.post(
  '/validate',
  validate({ body: validateSchema }),
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body as z.infer<typeof validateSchema>;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true }).lean();

    if (!coupon) {
      res.json({ valid: false, discount: 0, message: 'Coupon not found' });
      return;
    }

    const now = new Date();

    if (now < coupon.validFrom) {
      res.json({ valid: false, discount: 0, message: 'Coupon is not yet active' });
      return;
    }
    if (now > coupon.validTill) {
      res.json({ valid: false, discount: 0, message: 'Coupon has expired' });
      return;
    }
    if (subtotal < coupon.minOrderAmount) {
      res.json({
        valid: false,
        discount: 0,
        message: `Minimum order amount ₹${coupon.minOrderAmount / 100} required`,
      });
      return;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.json({ valid: false, discount: 0, message: 'Coupon usage limit reached' });
      return;
    }

    let discount = 0;
    if (coupon.type === 'flat') {
      discount = Math.min(coupon.value, subtotal);
    } else {
      const pct = Math.floor((subtotal * coupon.value) / 100);
      discount = coupon.maxDiscount ? Math.min(pct, coupon.maxDiscount) : pct;
    }

    res.json({ valid: true, discount, message: `Coupon applied! You save ₹${(discount / 100).toFixed(2)}` });
  }),
);

export default router;
