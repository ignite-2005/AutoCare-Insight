/** Keep datetime-local inputs in the browser's timezone and send an explicit instant. */
export function appointmentInstant(input: string): string {
  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) throw new Error('Choose a valid appointment date and time.');
  return date.toISOString();
}

export function appointmentLocalInput(instant: string): string {
  const date = new Date(instant);
  if (!Number.isFinite(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
