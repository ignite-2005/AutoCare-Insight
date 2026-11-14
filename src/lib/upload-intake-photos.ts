import { MAX_BATCH_BYTES, MAX_INTAKE_PHOTOS, MAX_PHOTO_BYTES } from './intake-photo-limits';

/** Send one image per request so the existing limits also work on serverless hosts. */
export async function uploadIntakePhotos<T = unknown>(appointmentId: number, files: File[], caption: string): Promise<T[]> {
  if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) throw new Error('Invalid appointment');
  if (files.length > MAX_INTAKE_PHOTOS || files.reduce((total, file) => total + file.size, 0) > MAX_BATCH_BYTES) {
    throw new Error('Choose no more than 6 photos totalling 12 MB or less.');
  }
  if (files.some(file => !file.size || file.size > MAX_PHOTO_BYTES)) throw new Error('Each photo must be non-empty and no larger than 3 MB.');
  let photos: T[] = [];
  for (const file of files) {
    const body = new FormData();
    body.append('photos', file);
    body.append('caption', caption);
    const response = await fetch(`/api/appointments/${appointmentId}/photos`, { method: 'POST', body });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success || !Array.isArray(result.data?.photos)) {
      throw new Error(result?.error?.message || 'Could not save intake photos');
    }
    photos = result.data.photos;
  }
  return photos;
}
