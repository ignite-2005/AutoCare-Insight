import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { enforcePermission } from '@/lib/auth/rbac';
import { queryOne } from '@/lib/db/mysql';
import { NotFoundError, ValidationError } from '@/lib/db/errors';
import { handleApiError } from '@/lib/utils/api-response';
import { positiveId } from '@/lib/intake-photos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; photoId: string }> }) {
  try {
    const user = requireAuth(req);
    enforcePermission(user, 'view_appointments');
    const id = positiveId((await params).id);
    if (!/^[0-9a-f-]{36}$/i.test((await params).photoId)) throw new ValidationError('Invalid photo ID');
    const photo = await queryOne<any>('SELECT image_data, mime_type FROM appointment_intake_photos WHERE appointment_id = ? AND photo_id = ?', [id, (await params).photoId]);
    if (!photo) throw new NotFoundError('Photo not found');
    return new Response(new Uint8Array(photo.image_data), { headers: {
      'Content-Type': photo.mime_type,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline; filename="intake-photo"',
      'Content-Security-Policy': "default-src 'none'; sandbox",
    } });
  } catch (error) { return handleApiError(error); }
}
