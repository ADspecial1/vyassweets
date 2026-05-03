import { Router } from 'express';
import { z } from 'zod';
import Banner from '../../models/Banner.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';

const router = Router();
router.use(requireAdmin);

const createSchema = z.object({
  image: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 });
    res.json({ banners });
  }),
);

router.post(
  '/',
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const banner = await Banner.create(req.body);
    res.status(201).json({ banner });
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params['id']);
    if (!banner) throw new AppError(404, 'Banner not found', 'NOT_FOUND');
    res.json({ banner });
  }),
);

router.patch(
  '/:id',
  validate({ body: updateSchema }),
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndUpdate(req.params['id'], req.body, {
      new: true,
      runValidators: true,
    });
    if (!banner) throw new AppError(404, 'Banner not found', 'NOT_FOUND');
    res.json({ banner });
  }),
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndDelete(req.params['id']);
    if (!banner) throw new AppError(404, 'Banner not found', 'NOT_FOUND');
    res.json({ ok: true });
  }),
);

export default router;
