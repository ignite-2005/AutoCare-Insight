/** Production must never fall back to a public example signing key. */
export function getSigningSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (process.env.NODE_ENV === 'production') {
    if (!configured || configured.length < 32 || /^(super_secret|replace_|your_|autocare_secret_key)/i.test(configured)) {
      throw new Error('Configure a unique JWT_SECRET of at least 32 characters for production.');
    }
    return configured;
  }
  return configured || 'autocare_development_only_secret';
}
