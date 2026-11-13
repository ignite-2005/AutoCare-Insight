require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { getSigningSecret } = require('../src/lib/auth/signing-secret.ts');
const { createSessionToken, verifySessionToken } = require('../src/lib/auth/session.ts');
const user = { user_id: 1, email: 'unit@example.invalid', full_name: 'Unit Test', role: 'admin' };
function configure(t, mode, secret) {
  const previous = { mode: process.env.NODE_ENV, secret: process.env.JWT_SECRET };
  process.env.NODE_ENV = mode;
  if (secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = secret;
  t.after(() => {
    if (previous.mode === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous.mode;
    if (previous.secret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previous.secret;
  });
}
test('production cannot mint a session using a missing signing secret', t => {
  configure(t, 'production');
  assert.throws(() => createSessionToken(user), /Configure a unique JWT_SECRET/);
  assert.equal(verifySessionToken('untrusted'), null);
});
test('production rejects short and known example signing keys without disclosing them', t => {
  configure(t, 'production');
  for (const secret of ['short-private-value', 'super_secret_jwt_token_autocare_insight_pes_2026', 'replace_with_random_64_character_secret']) {
    process.env.JWT_SECRET = secret;
    assert.throws(() => getSigningSecret(), error => !error.message.includes(secret));
  }
});
test('a generated production secret signs and verifies the real session', t => {
  configure(t, 'production', crypto.randomBytes(48).toString('base64url'));
  const token = createSessionToken(user);
  assert.equal(verifySessionToken(token).user_id, user.user_id);
  assert.equal(verifySessionToken(token).role, 'admin');
});
test('the development fallback remains usable for local evaluation', t => {
  configure(t, 'development');
  assert.equal(verifySessionToken(createSessionToken(user)).user_id, user.user_id);
});
