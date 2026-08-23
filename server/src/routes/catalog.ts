import { Router } from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Banner from '../models/Banner.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/AppError.js';
import { searchService } from '../lib/serviceClient.js';

const router = Router();

router.get('/categories', asyncHandler(async (_req, res) => {
  const categories = await Category.find({ active: true }).sort({ displayOrder: 1, name: 1 });
  res.set('Cache-Control', 'public, max-age=300');
  res.json(categories);
}));

router.get('/categories/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params['slug'], active: true });
  if (!category) throw new AppError(404, 'Category not found');
  res.set('Cache-Control', 'public, max-age=300');
  res.json(category);
}));

router.get('/products', asyncHandler(async (req, res) => {
  const { category, search, sort, featured, page = '1', limit = '12' } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

  // Search queries are handled by search-service (text index + relevance ranking).
  // Browsing (category/featured/sort) stays in the monolith.
  if (search) {
    const result = await searchService.search({ q: search, page: pageNum, limit: limitNum, category });
    res.json(result);
    return;
  }

  const skip = (pageNum - 1) * limitNum;
  const filter: Record<string, unknown> = { active: true };

  if (featured === 'true') filter['featured'] = true;

  if (category) {
    const cat = await Category.findOne({ slug: category, active: true }).select('_id');
    if (!cat) {
      res.json({ items: [], total: 0, page: pageNum, pages: 0 });
      return;
    }
    filter['categoryId'] = cat._id;
  }

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price-asc') sortObj = { price: 1 };
  else if (sort === 'price-desc') sortObj = { price: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate({ path: 'categoryId', select: 'name slug' }),
    Product.countDocuments(filter),
  ]);

  const items = products.map((p) => {
    const obj = p.toObject() as unknown as Record<string, unknown>;
    obj['category'] = obj['categoryId'];
    delete obj['categoryId'];
    return obj;
  });

  res.set('Cache-Control', 'public, max-age=300');
  res.json({ items, total, page: pageNum, pages: Math.ceil(total / limitNum) });
}));

router.get('/products/:slug', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params['slug'], active: true })
    .populate({ path: 'categoryId', select: 'name slug' });
  if (!product) throw new AppError(404, 'Product not found');
  const obj = product.toObject() as unknown as Record<string, unknown>;
  obj['category'] = obj['categoryId'];
  delete obj['categoryId'];
  res.set('Cache-Control', 'public, max-age=300');
  res.json(obj);
}));

router.get('/banners', asyncHandler(async (_req, res) => {
  const banners = await Banner.find({ active: true }).sort({ displayOrder: 1 });
  res.set('Cache-Control', 'public, max-age=300');
  res.json(banners);
}));

export default router;
