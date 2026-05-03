import { Router } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import Category from '../../models/Category.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';

const router = Router();
router.use(requireAdmin);

const createSchema = z.object({
  name: z.string().min(1).max(100),
  image: z.string().optional(),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

router.get('/', asyncHandler(async (_req, res) => {
  const categories = await Category.find()
    .populate('parentId', 'name slug')
    .sort({ displayOrder: 1, createdAt: -1 });
  res.json(categories);
}));

router.post('/', validate({ body: createSchema }), asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params['id']).populate('parentId', 'name slug');
  if (!category) throw new AppError(404, 'Category not found');
  res.json(category);
}));

router.patch('/:id', validate({ body: updateSchema }), asyncHandler(async (req, res) => {
  const update: Record<string, unknown> = { ...req.body };
  if (typeof update['name'] === 'string') {
    update['slug'] = slugify(update['name'], { lower: true, strict: true });
  }
  const category = await Category.findByIdAndUpdate(req.params['id'], update, { new: true, runValidators: true });
  if (!category) throw new AppError(404, 'Category not found');
  res.json(category);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params['id']);
  if (!category) throw new AppError(404, 'Category not found');
  // Delete all subcategories too
  await Category.deleteMany({ parentId: req.params['id'] });
  res.json({ ok: true });
}));

export default router;
