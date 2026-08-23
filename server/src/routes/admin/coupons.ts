import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';
import Coupon from '../../models/Coupon.js';

const router = Router();
router.use(requireAdmin);

const createSchema = z
  .object({
    code: z.string().min(1).max(30),
    type: z.enum(['flat', 'percent']),
    value: z.number().positive(),
    minOrderAmount: z.number().int().nonnegative().default(0),
    maxDiscount: z.number().int().positive().optional(),
    usageLimit: z.number().int().positive().optional(),
    validFrom: z.coerce.date(),
    validTill: z.coerce.date(),
    active: z.boolean().default(true),
  })
  .refine((data) => data.validTill > data.validFrom, {
    message: 'validTill must be after validFrom',
    path: ['validTill'],
  })
  .refine((data) => data.type !== 'percent' || data.value <= 100, {
    message: 'Percent discount cannot exceed 100',
    path: ['value'],
  });

const updateSchema = z.object({
  code: z.string().min(1).max(30).optional(),
  type: z.enum(['flat', 'percent']).optional(),
  value: z.number().positive().optional(),
  minOrderAmount: z.number().int().nonnegative().optional(),
  maxDiscount: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  validFrom: z.coerce.date().optional(),
  validTill: z.coerce.date().optional(),
  active: z.boolean().optional(),
});

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  }),
);

router.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const body = req.body as z.infer<typeof createSchema>;
    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) throw new AppError(409, 'A coupon with this code already exists');

    const coupon = await Coupon.create({ ...body, code: body.code.toUpperCase() });
    res.status(201).json(coupon);
  }),
);

router.patch(
  '/:id',
  validate({ body: updateSchema }),
  asyncHandler(async (req, res) => {
    const update: Record<string, unknown> = { ...req.body };
    if (typeof update['code'] === 'string') update['code'] = update['code'].toUpperCase();

    if (update['code']) {
      const existing = await Coupon.findOne({ code: update['code'], _id: { $ne: req.params.id } });
      if (existing) throw new AppError(409, 'A coupon with this code already exists');
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!coupon) throw new AppError(404, 'Coupon not found');
    res.json(coupon);
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) throw new AppError(404, 'Coupon not found');
    res.json({ ok: true });
  }),
);

export default router;
