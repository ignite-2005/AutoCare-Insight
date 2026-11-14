require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { uploadIntakePhotos } = require('../src/lib/upload-intake-photos.ts');

test('a full six-photo selection stays below the hosting payload limit and preserves captions', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const requests = [];
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/appointments/123/photos');
    assert.equal(options.method, 'POST');
    assert.equal(options.body.getAll('photos').length, 1);
    assert.equal(options.body.get('caption'), 'Intake condition');
    const encoded = await new Response(options.body).arrayBuffer();
    assert.ok(encoded.byteLength < 4_500_000, 'multipart request must fit the hosting limit');
    requests.push(options.body.get('photos').name);
    return Response.json({ success: true, data: { photos: requests.map(name => ({ name })) } });
  };
  const files = Array.from({ length: 6 }, (_, i) => new File([new Uint8Array(2 * 1024 * 1024)], `photo-${i}.jpg`, { type: 'image/jpeg' }));
  const saved = await uploadIntakePhotos(123, files, 'Intake condition');
  assert.equal(requests.length, 6);
  assert.equal(saved.length, 6);
});

test('invalid selections make no requests and a failed upload stops the remaining requests', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return calls === 1 ? Response.json({ success: true, data: { photos: [] } }) : new Response('upstream unavailable', { status: 503 });
  };
  const small = new File(['data'], 'small.jpg', { type: 'image/jpeg' });
  await assert.rejects(uploadIntakePhotos(1, Array(7).fill(small), ''), /no more than 6/);
  assert.equal(calls, 0);
  await assert.rejects(uploadIntakePhotos(1, [small, small, small], ''), /Could not save intake photos/);
  assert.equal(calls, 2);
});
