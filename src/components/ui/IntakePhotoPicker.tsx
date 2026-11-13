'use client';
/* eslint-disable @next/next/no-img-element -- Local previews and authenticated image endpoints use native images. */
import { useEffect, useState } from 'react';
import { MAX_INTAKE_PHOTOS, MAX_PHOTO_BYTES, MAX_BATCH_BYTES } from '@/lib/intake-photo-limits';

interface Props { files: File[]; onChange: (files: File[]) => void; disabled?: boolean }
export function IntakePhotoPicker({ files, onChange, disabled }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);
  function add(selected: FileList | null) {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)];
    if (next.length > MAX_INTAKE_PHOTOS) return setError('Choose no more than 6 photos.');
    if (next.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) return setError('Please choose JPEG, PNG or WebP photos.');
    if (next.some(file => !file.size || file.size > MAX_PHOTO_BYTES)) return setError('Each photo must be non-empty and no larger than 3 MB.');
    if (next.reduce((sum, file) => sum + file.size, 0) > MAX_BATCH_BYTES) return setError('Selected photos must total 12 MB or less.');
    setError(''); onChange(next);
  }
  return <section className="space-y-3 rounded-lg border border-slate-200 p-3">
    <h4 className="font-semibold text-slate-800">Vehicle condition photos (optional)</h4>
    <p className="text-xs text-slate-500">Record all sides, existing scratches, dents and the odometer before work begins. Up to 6 JPEG, PNG or WebP photos, 3 MB each, 12 MB total.</p>
    <label className="block text-xs font-semibold text-slate-700">Choose photos
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled} onChange={e => { add(e.target.files); e.target.value = ''; }} className="mt-1 block w-full text-xs" />
    </label>
    <label className="block text-xs font-semibold text-slate-700">Or take a photo (supported phones)
      <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={disabled} onChange={e => { add(e.target.files); e.target.value = ''; }} className="mt-1 block w-full text-xs" />
    </label>
    {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((file, index) => <div key={`${file.name}-${index}`} className="rounded-lg border border-slate-200 p-2">
        {previews[index] && <img src={previews[index]} alt={`Selected intake photo ${index + 1}`} className="h-24 w-full rounded object-contain" />}
        <p className="mt-1 truncate text-xs text-slate-600">{file.name}</p>
        <button type="button" disabled={disabled} onClick={() => { onChange(files.filter((_, i) => i !== index)); setError(''); }} className="mt-1 text-xs font-semibold text-rose-600">Remove selected photo {index + 1}</button>
      </div>)}
    </div>
  </section>;
}
