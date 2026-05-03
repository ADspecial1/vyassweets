// STUB — real AWS S3 implementation deferred to Phase 2.5.
// Admin UI uses POST /api/admin/images/url-only to paste public URLs instead.
export interface PresignedUploadResult {
  uploadUrl: string;
  fileUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getPresignedUploadUrl(_input: {
  contentType: string;
  ext: string;
}): Promise<PresignedUploadResult> {
  return { uploadUrl: 'STUB', fileUrl: 'STUB' };
}
