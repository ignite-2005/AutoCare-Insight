require('./env');
const fs=require('fs'), path=require('path'), os=require('os'), assert=require('node:assert/strict');
const {randomUUID,createHash}=require('crypto');
const fixturePath=path.join(os.tmpdir(),'autocare-intake-ui-fixture.json');
async function main(){
 const c=await require('mysql2/promise').createConnection({host:process.env.MYSQL_HOST,port:Number(process.env.MYSQL_PORT),user:process.env.MYSQL_USER,password:process.env.MYSQL_PASSWORD,database:process.env.MYSQL_DATABASE});
 async function snapshot(){const [tables]=await c.query("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");const result={};for(const {name}of tables){assert.match(name,/^[a-z_]+$/i);const [rows]=await c.query('SELECT * FROM `'+name+'` ORDER BY 1');result[name]=createHash('sha256').update(JSON.stringify(rows)).digest('hex');}return result;}
 try {
  if(process.argv[2]==='cleanup'){
   const data=JSON.parse(fs.readFileSync(fixturePath,'utf8'));
   const [owners]=await c.execute('SELECT full_name FROM customers WHERE customer_id=?',[data.customer]);
   assert.equal(owners[0]?.full_name,data.name,'Only clean up our own test customer');
   const [appts]=await c.execute('SELECT appointment_id FROM appointments WHERE vehicle_id=? AND customer_id=?',[data.vehicle,data.customer]);
   for(const {appointment_id}of appts){await c.execute('DELETE FROM appointment_intake_photos WHERE appointment_id=?',[appointment_id]);await c.execute('DELETE FROM appointments WHERE appointment_id=?',[appointment_id]);}
   await c.execute('DELETE FROM customer_vehicles WHERE vehicle_id=? AND customer_id=?',[data.vehicle,data.customer]);
   await c.execute('DELETE FROM customers WHERE customer_id=?',[data.customer]);
   assert.deepEqual(await snapshot(),data.baseline,'Existing records unchanged after browser test');
   fs.unlinkSync(data.photo);fs.unlinkSync(fixturePath);console.log('Browser fixture cleaned; existing records unchanged: PASS');
  } else {
   if(fs.existsSync(fixturePath))throw new Error('Browser fixture already exists; clean it up first');
   const baseline=await snapshot();const tag=randomUUID().slice(0,8);const name='Intake UI verification '+tag;
   const [customer]=await c.execute('INSERT INTO customers (full_name,phone) VALUES (?,?)',[name,'ui-'+tag]);
   const [vehicle]=await c.execute('INSERT INTO customer_vehicles (customer_id,license_plate,catalogue_id) VALUES (?,?,1)',[customer.insertId,'UI-'+tag]);
   const photo=path.join(os.tmpdir(),'autocare-intake-'+tag+'.png');
   await require('sharp')({create:{width:120,height:80,channels:3,background:'#38bdf8'}}).png().toFile(photo);
   const data={customer:customer.insertId,vehicle:vehicle.insertId,name,photo,baseline};fs.writeFileSync(fixturePath,JSON.stringify(data));
   console.log(JSON.stringify({customer:data.customer,vehicle:data.vehicle,photo:data.photo,name}));
  }
 }finally{await c.end();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1});
