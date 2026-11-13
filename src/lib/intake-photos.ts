import { createHash } from 'crypto';
import sharp from 'sharp';
import { ValidationError } from './db/errors';

export { MAX_INTAKE_PHOTOS, MAX_PHOTO_BYTES, MAX_BATCH_BYTES } from './intake-photo-limits';
import { MAX_PHOTO_BYTES, MAX_BATCH_BYTES } from './intake-photo-limits';
const allowed: Record<string, string> = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export function positiveId(value: string): number {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) throw new ValidationError('Invalid record ID');
  return id;
}

// Bound the actual stream, including requests without a Content-Length header.
export async function readPhotoForm(request: Request): Promise<FormData> {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new ValidationError('Use multipart image upload');
  const limit = MAX_BATCH_BYTES + 64 * 1024;
  if (Number(request.headers.get('content-length')) > limit) throw new ValidationError('Upload is too large (12 MB total)');
  const reader = request.body?.getReader();
  if (!reader) throw new ValidationError('No upload provided');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new ValidationError('Upload is too large (12 MB total)'); }
      chunks.push(value);
    }
    return await new Response(Buffer.concat(chunks), { headers: { 'content-type': request.headers.get('content-type')! } }).formData();
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid image upload');
  } finally { reader.releaseLock(); }
}

export async function validatePhoto(file: File) {
  if (!file.size || file.size > MAX_PHOTO_BYTES) throw new ValidationError('Each photo must be between 1 byte and 3 MB');
  if (!Object.values(allowed).includes(file.type) || !/\.(jpe?g|png|webp)$/i.test(file.name)) throw new ValidationError('Only JPEG, PNG and WebP photos are supported');
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const image = sharp(bytes, { limitInputPixels: 20_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    if (!metadata.format || allowed[metadata.format] !== file.type || (metadata.pages || 1) > 1) throw new Error('Unsupported format');
    // Decode the pixels, rather than trusting extension/MIME/signature alone.
    await image.stats();
  } catch {
    throw new ValidationError('Photo could not be decoded. Use a valid, non-animated JPEG, PNG or WebP under 20 megapixels');
  }
  return {
    bytes,
    mime: file.type,
    name: file.name.replace(/^.*[\\/]/, '').replace(/[\x00-\x1f\x7f]/g, '').slice(0, 120) || 'intake-photo',
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}
