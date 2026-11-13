import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAuth } from '@/lib/auth/session';
import { enforcePermission } from '@/lib/auth/rbac';
import { query, queryOne } from '@/lib/db/mysql';
import { withTransaction } from '@/lib/db/transaction';
import { ConflictError, NotFoundError, ValidationError } from '@/lib/db/errors';
import { jsonSuccess, handleApiError } from '@/lib/utils/api-response';
import { MAX_BATCH_BYTES, MAX_INTAKE_PHOTOS, positiveId, readPhotoForm, validatePhoto } from '@/lib/intake-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
interface Context { params: { id: string } }

async function listPhotos(id: number) {
  const photos = await query<any>(`SELECT photo_id, original_name, caption, mime_type, byte_size, sha256, uploaded_at, uploaded_by
    FROM appointment_intake_photos WHERE appointment_id = ? ORDER BY uploaded_at, photo_id`, [id]);
  return photos.map(photo => ({ ...photo, url: `/api/appointments/${id}/photos/${photo.photo_id}` }));
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const user = requireAuth(req);
    enforcePermission(user, 'view_appointments');
    const id = positiveId(params.id);
    if (!await queryOne('SELECT appointment_id FROM appointments WHERE appointment_id = ?', [id])) throw new NotFoundError('Appointment not found');
    const response = jsonSuccess({ photos: await listPhotos(id) });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: NextRequest, { params }: Context) {
  try {
    const user = requireAuth(req);
    enforcePermission(user, 'manage_appointments');
    const id = positiveId(params.id);
    // Require same-origin requests for a state-changing cookie-authenticated upload.
    const origin = req.headers.get('origin');
    if (origin && origin !== req.nextUrl.origin) throw new ValidationError('Invalid upload origin');
    const appointment = await queryOne<any>('SELECT status FROM appointments WHERE appointment_id = ?', [id]);
    if (!appointment) throw new NotFoundError('Appointment not found');
    if (!['pending', 'confirmed'].includes(appointment.status)) throw new ConflictError('Intake photos are locked after work starts or the appointment closes');
    const form = await readPhotoForm(req);
    const files = form.getAll('photos');
    if (!files.length || files.length > MAX_INTAKE_PHOTOS || files.some(file => typeof file === 'string')) throw new ValidationError('Choose between 1 and 6 photos');
    if (files.reduce((size, file) => size + (file as File).size, 0) > MAX_BATCH_BYTES) throw new ValidationError('Photos must total 12 MB or less');
    const caption = form.get('caption') || '';
    if (typeof caption !== 'string' || caption.length > 250) throw new ValidationError('Condition note must be 250 characters or less');
    const validated = [];
    for (const file of files) validated.push(await validatePhoto(file as File));
    await withTransaction(async tx => {
      // Serialize uploads and status transitions for this appointment.
      const current = await tx.queryOne<any>('SELECT status FROM appointments WHERE appointment_id = ? FOR UPDATE', [id]);
      if (!current || !['pending', 'confirmed'].includes(current.status)) throw new ConflictError('Intake photos are locked after work starts or the appointment closes');
      if (await tx.queryOne('SELECT job_id FROM service_jobs WHERE appointment_id = ? LIMIT 1', [id])) throw new ConflictError('Intake photos are locked because workshop work has already started');
      const existing = await tx.query<any>('SELECT sha256 FROM appointment_intake_photos WHERE appointment_id = ?', [id]);
      const hashes = new Set(existing.map(photo => photo.sha256));
      const additions = validated.filter(photo => {
        if (hashes.has(photo.sha256)) return false;
        hashes.add(photo.sha256); return true;
      });
      if (existing.length + additions.length > MAX_INTAKE_PHOTOS) throw new ValidationError('An appointment can have at most 6 intake photos');
      for (const photo of additions) await tx.execute(`INSERT INTO appointment_intake_photos
        (photo_id, appointment_id, uploaded_by, original_name, caption, mime_type, byte_size, sha256, image_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [randomUUID(), id, user.user_id, photo.name, caption.trim(), photo.mime, photo.bytes.length, photo.sha256, photo.bytes]);
    });
    const response = jsonSuccess({ photos: await listPhotos(id) }, 201);
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (error) { return handleApiError(error); }
}
