require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { requireAssignedJob } = require('../src/lib/auth/job-access.ts');
const mechanic = { role: 'mechanic', user_id: 4 };

test('mechanics can update their own assignments but cannot claim unassigned jobs', () => {
  assert.doesNotThrow(() => requireAssignedJob(mechanic, { mechanic_id: 4 }));
  assert.throws(() => requireAssignedJob(mechanic, { mechanic_id: null }));
  assert.throws(() => requireAssignedJob(mechanic, { mechanic_id: 5 }));
});
test('mechanic assignment changes require administrator or advisor access', () => {
  assert.throws(() => requireAssignedJob(mechanic, { mechanic_id: 4 }, 5));
  assert.throws(() => requireAssignedJob(mechanic, { mechanic_id: 4 }, null));
  assert.doesNotThrow(() => requireAssignedJob(mechanic, { mechanic_id: 4 }, 4));
  for (const role of ['admin', 'service_advisor']) {
    assert.doesNotThrow(() => requireAssignedJob({ role, user_id: 1 }, { mechanic_id: null }, 5));
  }
});
