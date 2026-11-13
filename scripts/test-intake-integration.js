require('./env');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const sharp = require('sharp');
const { randomUUID, createHash } = require('crypto');
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
let cookie='', checks=0;
async function request(path, options={}, status=200, binary=false) {
 const response = await fetch(base+path,{...options, headers:{Cookie:cookie,...options.headers},signal:AbortSignal.timeout(90000)});
 const body=binary?Buffer.from(await response.arrayBuffer()):await response.json();
 assert.equal(response.status,status,`${path}: expected ${status}, got ${response.status}${binary?'':': '+JSON.stringify(body.error||{})}`);
 checks++;return {response,body};
}
async function login(email){const {response}=await request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:'password123'})});cookie=response.headers.get('set-cookie').split(';')[0];}
async function fixture(color,format='png') { return sharp({create:{width:8,height:8,channels:3,background:color}}).toFormat(format).toBuffer(); }
function batch(files,caption='Existing scratch near left rear wheel') { const body=new FormData(); for(const file of files)body.append('photos',file); body.append('caption',caption);return body; }
const file=(bytes,name='car.png',type='image/png')=>new File([bytes],name,{type});
async function main(){
 const c=await mysql.createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
 const ids={};let baseline;
 async function snapshot(){
  const [tables]=await c.query("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  const hashes={};
  for(const {name} of tables){assert.match(name,/^[a-z_]+$/i);const [rows]=await c.query('SELECT * FROM `'+name+'` ORDER BY 1');hashes[name]=createHash('sha256').update(JSON.stringify(rows)).digest('hex');}
  return hashes;
 }
 try {
  baseline=await snapshot();
  await request('/api/appointments/1/photos',{},401);
  await login('admin@autocare.com');
  const tag=randomUUID().slice(0,8);
  const [customer]=await c.execute('INSERT INTO customers (full_name,phone) VALUES (?,?)',['Intake verification '+tag,'test-'+tag]);ids.customer=customer.insertId;
  const [vehicle]=await c.execute('INSERT INTO customer_vehicles (customer_id,license_plate,catalogue_id) VALUES (?,?,1)',[ids.customer,'INTAKE-'+tag]);ids.vehicle=vehicle.insertId;
  const future=new Date(Date.now()+14*86400000);future.setUTCMinutes(0,0,0);
  const booked=await request('/api/appointments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer_id:ids.customer,vehicle_id:ids.vehicle,service_type_id:1,scheduled_at:future.toISOString()})},201);
  ids.appointment=booked.body.data.appointment_id;assert.ok(ids.appointment);checks++;
  const root=`/api/appointments/${ids.appointment}/photos`;
  assert.deepEqual((await request(root)).body.data.photos,[]);checks++;
  await request('/api/appointments/0/photos',{},422);
  await request('/api/appointments/2147483000/photos',{},404);
  await request(root,{method:'POST',body:batch([])},422);
  await request(root,{method:'POST',body:JSON.stringify({photos:[]}),headers:{'Content-Type':'application/json'}},422);
  const original=await fixture('#ff0000');
  await request(root,{method:'POST',body:batch([file(original),file(Buffer.from('fake photo'),'fake.jpg','image/jpeg')])},422);
  assert.equal((await request(root)).body.data.photos.length,0,'Invalid batch must not partially save');checks++;
  await request(root,{method:'POST',body:batch([file(Buffer.alloc(3*1024*1024+1))])},422);
  await request(root,{method:'POST',body:batch([file(original)]),headers:{Origin:'https://other.example'}},422);
  const upload=await request(root,{method:'POST',body:batch([file(original)])},201);
  const saved=upload.body.data.photos[0];assert.equal(saved.caption,'Existing scratch near left rear wheel');assert.equal(saved.uploaded_by,1);assert.ok(Number.isFinite(Date.parse(saved.uploaded_at)));assert.equal(saved.sha256,createHash('sha256').update(original).digest('hex'));assert.equal(saved.image_data,undefined);checks+=5;
  const image=await request(saved.url,{},200,true);assert.deepEqual(image.body,original);assert.equal(image.response.headers.get('content-type'),'image/png');assert.equal(image.response.headers.get('x-content-type-options'),'nosniff');assert.match(image.response.headers.get('cache-control'),/no-store/);checks+=4;
  await request(`/api/appointments/1/photos/${saved.photo_id}`,{},404);
  const duplicate=await request(root,{method:'POST',body:batch([file(original)])},201);assert.equal(duplicate.body.data.photos.length,1,'Retry should not duplicate a photo');checks++;
  // Staff roles: mechanics can inspect evidence but cannot upload it.
  await login('suresh@autocare.com');await request(root);await request(saved.url,{},200,true);await request(root,{method:'POST',body:batch([file(original)])},403);
  cookie='';await request(saved.url,{},401);
  await login('rajesh@autocare.com');
  const more=[];for(const [color,format] of [['#00ff00','jpeg'],['#0000ff','webp'],['#ffff00','png'],['#00ffff','png'],['#ff00ff','png']])more.push(file(await fixture(color,format),'car.'+(format==='jpeg'?'jpg':format),'image/'+format));
  const filled=await request(root,{method:'POST',body:batch(more)},201);assert.equal(filled.body.data.photos.length,6);checks++;
  await request(root,{method:'POST',body:batch([file(await fixture('#010101'))])},422);
  await request(root,{method:'POST',body:batch(Array.from({length:7},()=>file(original)))},422);
  await login('admin@autocare.com');
  for(const status of ['cancelled','completed','in_progress']){await request('/api/appointments/'+ids.appointment,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});await request(root,{method:'POST',body:batch([file(original)])},409);await request(saved.url,{},200,true);}
  await request('/api/appointments/'+ids.appointment,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'confirmed'})});
  const job=await request('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({appointment_id:ids.appointment,mechanic_id:4,odometer_in:1000})},201);ids.job=job.body.data.job.job_id;
  await request(root,{method:'POST',body:batch([file(original)])},409);
  await c.execute("UPDATE appointments SET status='pending' WHERE appointment_id=?",[ids.appointment]);
  await request(root,{method:'POST',body:batch([file(original)])},409);
  const afterJob=await request(root);assert.equal(afterJob.body.data.photos.length,6);checks++;
  console.log('Intake feature checks passed:',checks);
 } finally {
  // Remove only this script's own temporary records; compare every pre-existing table afterwards.
  if(ids.appointment)await c.execute('DELETE FROM appointment_intake_photos WHERE appointment_id=?',[ids.appointment]);
  if(ids.job)await c.execute('DELETE FROM service_jobs WHERE job_id=?',[ids.job]);
  if(ids.appointment)await c.execute('DELETE FROM appointments WHERE appointment_id=?',[ids.appointment]);
  if(ids.vehicle)await c.execute('DELETE FROM customer_vehicles WHERE vehicle_id=?',[ids.vehicle]);
  if(ids.customer)await c.execute('DELETE FROM customers WHERE customer_id=?',[ids.customer]);
  try { if(baseline) { assert.deepEqual(await snapshot(),baseline,'Pre-existing records must remain unchanged');console.log('All pre-existing database records unchanged: PASS'); } } finally {await c.end();}
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
