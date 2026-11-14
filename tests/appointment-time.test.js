const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

for (const timezone of ['Asia/Kolkata', 'UTC', 'America/New_York']) {
  test(`appointment inputs round-trip without moving time in ${timezone}`, () => {
    const result = spawnSync(process.execPath, ['-e', `
      require('./tests/register-typescript.cjs');
      const assert = require('node:assert/strict');
      const { appointmentInstant, appointmentLocalInput } = require('./src/lib/appointment-time.ts');
      for (const input of ['2026-11-16T10:45', '2026-07-16T23:15']) {
        const instant = appointmentInstant(input);
        assert.match(instant, /Z$/);
        assert.equal(appointmentLocalInput(instant), input);
      }
      assert.throws(() => appointmentInstant('invalid'));
      assert.equal(appointmentLocalInput('invalid'), '');
    `], { cwd: path.resolve(__dirname, '..'), env: { ...process.env, TZ: timezone }, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  });
}
