require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { validatePhoto, readPhotoForm, positiveId, MAX_PHOTO_BYTES, MAX_BATCH_BYTES } = require('../src/lib/intake-photos.ts');
const { createHash } = require('crypto');
const image = format => sharp({ create: { width: 4, height: 4, channels: 3, background: '#d84315' } }).toFormat(format).toBuffer();

for (const [format, type, extension] of [['jpeg','image/jpeg','jpg'], ['png','image/png','png'], ['webp','image/webp','webp']]) {
 test(`accepts and preserves real ${format} image bytes and computes checksum`, async () => {
   const bytes = await image(format);
   const result = await validatePhoto(new File([bytes], 'vehicle.' + extension, { type }));
   assert.deepEqual(result.bytes, bytes);
   assert.equal(result.sha256, createHash('sha256').update(bytes).digest('hex'));
   assert.equal(result.mime, type);
 });
}
test('rejects empty, oversized, spoofed, corrupt and unsupported files', async () => {
 const png = await image('png');
 for (const file of [
  new File([], 'empty.png', {type:'image/png'}),
  new File([Buffer.alloc(MAX_PHOTO_BYTES+1)], 'large.png', {type:'image/png'}),
  new File(['<svg onload="alert(1)"/>'], 'fake.jpg', {type:'image/jpeg'}),
  new File([png.subarray(0,30)], 'broken.png', {type:'image/png'}),
  new File([png], 'mismatch.jpg', {type:'image/jpeg'}),
  new File([png], 'script.html', {type:'image/png'}),
  new File([png], 'image.gif', {type:'image/gif'}),
 ]) await assert.rejects(validatePhoto(file));
});
test('rejects images above the decoded pixel limit', async () => {
 const bytes = await sharp({create:{width:5000,height:5000,channels:3,background:'#ffffff'}}).png().toBuffer();
 await assert.rejects(validatePhoto(new File([bytes],'large-dimensions.png',{type:'image/png'})));
});
test('sanitizes filename paths and control characters', async () => {
 const bytes=await image('png');
 const photo=await validatePhoto(new File([bytes],'../../folder/car\u0000.png',{type:'image/png'}));
 assert.equal(photo.name,'car.png');
});
test('record IDs reject decimals, negatives, unsafe numbers and SQL-like text', () => {
 assert.equal(positiveId('12'),12);
 for(const value of ['0','-1','1.5','1e2','1 OR 1=1','9007199254740992']) assert.throws(()=>positiveId(value));
});
test('parses a valid bounded multipart form', async () => {
 const body=new FormData(); body.append('photos',new File([await image('png')],'car.png',{type:'image/png'}));
 const parsed=await readPhotoForm(new Request('http://localhost/upload',{method:'POST',body}));
 assert.equal(parsed.getAll('photos').length,1);
});
test('rejects malformed multipart and incorrect content types', async () => {
 await assert.rejects(readPhotoForm(new Request('http://localhost/upload',{method:'POST',body:'not multipart'})));
 await assert.rejects(readPhotoForm(new Request('http://localhost/upload',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=missing'},body:'invalid'})));
});
test('bounds the real upload stream without trusting Content-Length', async () => {
 let sent=0;
 const body=new ReadableStream({pull(controller){
   if(sent++ < 14) controller.enqueue(new Uint8Array(1024*1024)); else controller.close();
 }});
 await assert.rejects(readPhotoForm(new Request('http://localhost/upload',{method:'POST',duplex:'half',headers:{'content-type':'multipart/form-data; boundary=test'},body})));
 const request = new Request('http://localhost/upload',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=test','content-length':String(MAX_BATCH_BYTES+65537)},body:'x'});
 await assert.rejects(readPhotoForm(request));
});
