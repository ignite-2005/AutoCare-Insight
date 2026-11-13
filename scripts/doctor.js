require('./env');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function main() {
  let failed = false;
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'autocare_insight',
      connectTimeout: 5000,
    });
    const [tables] = await connection.query('SHOW TABLES');
    const [counts] = await connection.query('SELECT (SELECT COUNT(*) FROM users) users, (SELECT COUNT(*) FROM vehicle_catalogue) catalogue');
    console.log('MySQL OK:', tables.length, 'tables/views;', counts[0]);
  } catch (error) {
    failed = true;
    console.error('MySQL FAILED:', error.code, '- check MYSQL_* in .env.local and run npm run setup:db.');
  } finally {
    if (connection) await connection.end();
  }
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'autocare_db');
    await db.command({ ping: 1 });
    const count = await db.collection('repair_reports').countDocuments();
    console.log('MongoDB OK:', count, 'repair reports');
    if (!count) { failed = true; console.error('Run npm run setup:db to seed reports.'); }
  } catch (error) {
    failed = true;
    console.error('MongoDB FAILED:', error.name, '- check MongoDB service and MONGODB_* in .env.local.');
  } finally { await client.close(); }
  process.exitCode = failed ? 1 : 0;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
