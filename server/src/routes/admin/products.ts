import { Router } from 'express';
import { z } from 'zod';
import slugify from 'slugify';
import Product from '../../models/Product.js';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';

const router = Router();
router.use(requireAdmin);

const discountSchema = z.object({
  type: z.enum(['flat', 'percent']),
  value: z.number().nonnegative(),
  active: z.boolean(),
});

const createSchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional().nullable(),
  description: z.string().default(''),
  shortDescription: z.string().optional(),
  images: z.array(z.string().min(1)).default([]),
  price: z.number().int().positive(),
  mrp: z.number().int().positive(),
  weight: z.number().positive(),
  unit: z.enum(['g', 'kg', 'pcs']),
  stock: z.number().int().min(0).default(0),
  sku: z.string().min(1).max(100),
  discount: discountSchema.optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().positive().max(100).catch(20),
});

router.get('/', validate({ query: listQuerySchema }), asyncHandler(async (req, res) => {
  const { category, search, page, limit } = req.query as unknown as z.infer<typeof listQuerySchema>;
  const filter: Record<string, unknown> = {};
  if (category) filter['categoryId'] = category;
  if (search) filter['$text'] = { $search: search };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
}));

router.post('/', validate({ body: createSchema }), asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params['id']).populate('categoryId', 'name slug');
  if (!product) throw new AppError(404, 'Product not found');
  res.json(product);
}));

router.patch('/:id', validate({ body: updateSchema }), asyncHandler(async (req, res) => {
  const update: Record<string, unknown> = { ...req.body };

  if (typeof update['name'] === 'string') {
    // Only regenerate slug when name actually changed to avoid duplicate-key 409
    const current = await Product.findById(req.params['id']).select('name').lean();
    if (current && current.name !== update['name']) {
      update['slug'] = slugify(update['name'] as string, { lower: true, strict: true });
    } else {
      delete update['slug'];
    }
  }

  const product = await Product.findByIdAndUpdate(req.params['id'], update, { new: true, runValidators: true });
  if (!product) throw new AppError(404, 'Product not found');
  res.json(product);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params['id']);
  if (!product) throw new AppError(404, 'Product not found');
  res.json({ ok: true });
}));

export default router;
