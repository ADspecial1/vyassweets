import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { AppError } from '../../lib/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../../public/uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/gif', 'image/bmp', 'image/tiff', 'image/avif',
]);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.avif']);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, or WebP.`));
    }
  },
});

// Wrap multer in a promise so asyncHandler can catch its errors (required for Express 5)
function runUpload(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, res, (err) => {
      if (err) reject(err instanceof multer.MulterError
        ? new AppError(400, err.message)
        : err instanceof Error ? new AppError(400, err.message) : err);
      else resolve();
    });
  });
}

const router = Router();
router.use(requireAdmin);

// POST /api/admin/upload — upload image file, returns hosted URL
router.post('/upload', asyncHandler(async (req, res) => {
  await runUpload(req, res);
  if (!req.file) throw new AppError(400, 'No file uploaded');
  const proto = req.get('x-forwarded-proto') ?? req.protocol;
  const host = req.get('x-forwarded-host') ?? req.get('host') ?? 'localhost:5000';
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl, fullUrl: `${proto}://${host}${fileUrl}` });
}));

const uploadUrlSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  ext: z.string().min(1).max(10),
});

// POST /api/admin/upload-url — stub for future S3 presigned URLs
router.post(
  '/upload-url',
  validate({ body: uploadUrlSchema }),
  asyncHandler(async (_req, res) => {
    res.json({ uploadUrl: 'STUB', fileUrl: 'STUB' });
  }),
);

const urlOnlySchema = z.object({ url: z.string().min(1) });

// POST /api/admin/images/url-only — store any public image URL directly
router.post(
  '/images/url-only',
  validate({ body: urlOnlySchema }),
  asyncHandler(async (req, res) => {
    const { url } = req.body as z.infer<typeof urlOnlySchema>;
    res.json({ fileUrl: url });
  }),
);

export default router;
