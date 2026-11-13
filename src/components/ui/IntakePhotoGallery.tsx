'use client';
/* eslint-disable @next/next/no-img-element -- Images are served through authenticated endpoints. */
import { useCallback, useEffect, useState } from 'react';
import { IntakePhotoPicker } from './IntakePhotoPicker';

interface Photo { photo_id: string; url: string; original_name: string; caption: string; uploaded_at: string; uploaded_by: number; sha256: string }
export function IntakePhotoGallery({ appointmentId, canUpload }: { appointmentId: number; canUpload: boolean }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/photos`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not load intake photos');
      setPhotos(json.data.photos);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load intake photos'); }
    finally { setLoading(false); }
  }, [appointmentId]);
  useEffect(() => { void load(); }, [load]);
  async function upload() {
    setBusy(true); setError('');
    try {
      const body = new FormData(); files.forEach(file => body.append('photos', file)); body.append('caption', caption);
      const res = await fetch(`/api/appointments/${appointmentId}/photos`, { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not save photos');
      setPhotos(json.data.photos); setFiles([]); setCaption('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save photos. You can retry.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4 text-xs">
    <p className="text-slate-600">Original intake photos are retained with their upload time, staff ID and SHA-256 checksum. Saved photos cannot be replaced or deleted here.</p>
    {error && <div role="alert" className="rounded border border-rose-200 bg-rose-50 p-3 text-rose-700">{error} <button type="button" onClick={load} className="underline">Reload photos</button></div>}
    {loading ? <p>Loading intake photos...</p> : !photos.length ? <p className="text-slate-500">No intake photos recorded for this appointment.</p> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {photos.map(photo => <article key={photo.photo_id} className="rounded-lg border border-slate-200 p-3">
        <a href={photo.url} target="_blank" rel="noopener noreferrer" aria-label={`Open original photo ${photo.original_name}`}><img src={photo.url} alt={photo.caption || 'Vehicle condition at intake'} className="h-44 w-full rounded bg-slate-100 object-contain" /></a>
        <p className="mt-2 font-semibold text-slate-800">{photo.caption || 'Vehicle intake photo'}</p>
        <p className="text-slate-500">Recorded {new Date(photo.uploaded_at).toLocaleString()} · Staff #{photo.uploaded_by}</p>
        <details className="mt-2 text-slate-500"><summary>Photo checksum</summary><p className="break-all font-mono">{photo.sha256}</p></details>
      </article>)}
    </div>}
    {canUpload && photos.length < 6 ? <>
      <IntakePhotoPicker files={files} onChange={setFiles} disabled={busy} />
      <label className="block font-semibold text-slate-700">Condition note (optional)
        <input value={caption} onChange={e => setCaption(e.target.value)} maxLength={250} disabled={busy} placeholder="e.g. Small scratch on rear-left door" className="mt-1 w-full rounded border border-slate-200 bg-slate-50 p-2" />
      </label>
      <p className="text-slate-500">{6 - photos.length} photo slots remaining. Photos can only be added before work starts.</p>
      <button type="button" onClick={upload} disabled={busy || !files.length} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Saving photos...' : 'Save intake photos'}</button>
    </> : <p className="text-slate-500">{photos.length >= 6 ? 'All 6 intake photo slots are used.' : 'Intake photos are read-only after work starts or the appointment closes.'}</p>}
  </div>;
}
