require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');

test('route-module reload reuses the existing MySQL pool instead of leaking connections', async (t) => {
  const modulePath = require.resolve('../src/lib/db/mysql.ts');
  const first = require(modulePath).getMySqlPool();
  t.after(async () => {
    await first.end();
    delete globalThis._autoCareMySqlPool;
    delete require.cache[modulePath];
  });
  // Simulate a development hot reload without connecting to or modifying a database.
  delete require.cache[modulePath];
  const reloaded = require(modulePath).getMySqlPool();
  assert.strictEqual(reloaded, first);
});

test('hosted MySQL pool verifies the certificate and hostname and accepts an explicit CA', async (t) => {
  const previousSsl = process.env.MYSQL_SSL;
  const previousCa = process.env.MYSQL_SSL_CA;
  const modulePath = require.resolve('../src/lib/db/mysql.ts');
  process.env.MYSQL_SSL = 'true';
  process.env.MYSQL_SSL_CA = 'certificate-line-one\\ncertificate-line-two';
  let pool;
  t.after(async () => {
    if (pool) await pool.end();
    delete globalThis._autoCareMySqlPool;
    delete require.cache[modulePath];
    if (previousSsl === undefined) delete process.env.MYSQL_SSL; else process.env.MYSQL_SSL = previousSsl;
    if (previousCa === undefined) delete process.env.MYSQL_SSL_CA; else process.env.MYSQL_SSL_CA = previousCa;
  });
  pool = require(modulePath).getMySqlPool();
  // Inspect the real driver's configuration without opening a database connection.
  const ssl = pool.pool.config.connectionConfig.ssl;
  assert.equal(ssl.rejectUnauthorized, true);
  assert.equal(ssl.verifyIdentity, true);
  assert.equal(ssl.minVersion, 'TLSv1.2');
  assert.equal(ssl.ca, 'certificate-line-one\ncertificate-line-two');
});

test('invalid MySQL TLS configuration fails before connecting without exposing its value', (t) => {
  const previousSsl = process.env.MYSQL_SSL;
  const modulePath = require.resolve('../src/lib/db/mysql.ts');
  process.env.MYSQL_SSL = 'false;private-config-value';
  t.after(() => {
    if (previousSsl === undefined) delete process.env.MYSQL_SSL; else process.env.MYSQL_SSL = previousSsl;
    delete require.cache[modulePath];
  });
  assert.throws(() => require(modulePath).getMySqlPool(), error => {
    assert.equal(error.message, 'MYSQL_SSL must be true or false.');
    assert.equal(globalThis._autoCareMySqlPool, undefined);
    return true;
  });
});

test('a hosted workshop clock is explicit in the actual pool configuration', async t => {
  const previous = process.env.MYSQL_TIMEZONE;
  const modulePath = require.resolve('../src/lib/db/mysql.ts');
  process.env.MYSQL_TIMEZONE = '+05:30';
  delete require.cache[modulePath];
  const pool = require(modulePath).getMySqlPool();
  t.after(async () => {
    await pool.end(); delete globalThis._autoCareMySqlPool; delete require.cache[modulePath];
    if (previous === undefined) delete process.env.MYSQL_TIMEZONE; else process.env.MYSQL_TIMEZONE = previous;
  });
  assert.equal(pool.pool.config.connectionConfig.timezone, '+05:30');
  assert.ok(pool.pool.listenerCount('connection') > 0);
});

test('an invalid workshop clock fails without revealing the supplied value', t => {
  const previous = process.env.MYSQL_TIMEZONE;
  const modulePath = require.resolve('../src/lib/db/mysql.ts');
  process.env.MYSQL_TIMEZONE = 'private-invalid-clock';
  delete require.cache[modulePath];
  t.after(() => {
    delete require.cache[modulePath];
    if (previous === undefined) delete process.env.MYSQL_TIMEZONE; else process.env.MYSQL_TIMEZONE = previous;
  });
  assert.throws(() => require(modulePath).getMySqlPool(), error => {
    assert.ok(!error.message.includes('private-invalid-clock'));
    assert.equal(globalThis._autoCareMySqlPool, undefined);
    return true;
  });
});
