import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../lib/asyncHandler.js';
import { getPresignedUploadUrl } from '../../services/s3.js';

const router = Router();
router.use(requireAdmin);

const uploadUrlSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  ext: z.string().min(1).max(10),
});

// POST /api/admin/upload-url — stub, real S3 in Phase 2.5
router.post(
  '/upload-url',
  validate({ body: uploadUrlSchema }),
  asyncHandler(async (req, res) => {
    const result = await getPresignedUploadUrl(req.body as z.infer<typeof uploadUrlSchema>);
    res.json(result);
  }),
);

const urlOnlySchema = z.object({
  url: z.string().min(1),
});

// POST /api/admin/images/url-only — paste any public image URL directly
router.post(
  '/images/url-only',
  validate({ body: urlOnlySchema }),
  asyncHandler(async (req, res) => {
    const { url } = req.body as z.infer<typeof urlOnlySchema>;
    res.json({ fileUrl: url });
  }),
);

export default router;
