require('./env');
const fs = require('fs');
const path = require('path');
async function main() {
  const connection = await require('mysql2/promise').createConnection({
    host: process.env.MYSQL_HOST || 'localhost', port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'autocare_insight',
  });
  try {
    await connection.query(fs.readFileSync(path.join(__dirname, '../database/09_appointment_intake_photos.sql'), 'utf8').replace(/^\uFEFF/, ''));
    console.log('Intake photo table ready. Existing records unchanged.');
  } finally { await connection.end(); }
}
main().catch(error => { console.error('Photo migration failed:', error.code || error.name); process.exitCode = 1; });
