require('./env');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');

// SQL files use the mysql CLI DELIMITER convention for stored routines.
async function runSql(connection, filename) {
  let delimiter = ';';
  let buffer = '';
  for (const line of fs.readFileSync(path.join(root, 'database', filename), 'utf8').split(/\r?\n/)) {
    if (filename.startsWith('advanced/') && /-- (DEMONSTRATION & VERIFICATION CALLS|STEP 3: Demonstration)/.test(line)) break;
    if (line.trim().startsWith('--') || !line.trim()) continue;
    const match = line.trim().match(/^DELIMITER\s+(\S+)/i);
    if (match) { delimiter = match[1]; continue; }
    buffer += line + '\n';
    if (buffer.trimEnd().endsWith(delimiter)) {
      await connection.query(buffer.trimEnd().slice(0, -delimiter.length));
      buffer = '';
    }
  }
  if (buffer.trim()) throw new Error('Unterminated SQL in ' + filename);
  console.log('Applied', filename);
}

async function setupMongo(connection) {
  // Reuse the project's schema and sample documents without requiring mongosh.
  const source = fs.readFileSync(path.join(root, 'database/06_mongodb_schema.js'), 'utf8');
  const capture = { options: null, documents: null, indexes: [] };
  const mockCollection = {
    createIndex: (...args) => capture.indexes.push(args),
    insertMany: docs => { capture.documents = docs; },
    aggregate: () => [],
    find: () => ({ sort: () => [] }),
  };
  vm.runInNewContext(source, {
    use: () => {},
    db: { createCollection: (name, options) => { capture.options = options; }, repair_reports: mockCollection },
    Date,
  });
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB_NAME || 'autocare_db');
    const options = { ...capture.options, validationAction: 'error' };
    if ((await db.listCollections({ name: 'repair_reports' }).toArray()).length) {
      await db.command({ collMod: 'repair_reports', ...options });
    } else { await db.createCollection('repair_reports', options); }
    const collection = db.collection('repair_reports');
    await collection.updateMany({ created_at: { $type: 'string' } }, [{ $set: { created_at: { $toDate: '$created_at' } } }]);
    for (const args of capture.indexes) await collection.createIndex(...args);
    for (const doc of capture.documents) {
      const [jobs] = await connection.query('SELECT job_id FROM service_jobs WHERE job_id = ? AND vehicle_id = ? AND mechanic_id = ?', [doc.job_id, doc.vehicle_id, doc.mechanic_id]);
      if (!jobs.length) continue;
      // Existing reports are never overwritten.
      await collection.updateOne({ job_id: doc.job_id }, { $setOnInsert: doc }, { upsert: true });
      const saved = await collection.findOne({ job_id: doc.job_id });
      await connection.execute('UPDATE service_jobs SET mongo_report_id = ? WHERE job_id = ?', [String(saved._id), doc.job_id]);
    }
    console.log('MongoDB schema, indexes, reports and MySQL links ready.');
  } finally { await client.close(); }
}

async function main() {
  const database = process.env.MYSQL_DATABASE || 'autocare_insight';
  if (database !== 'autocare_insight') throw new Error('Bundled SQL uses autocare_insight. Set MYSQL_DATABASE=autocare_insight.');
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '', connectTimeout: 5000,
  });
  try {
    await connection.query('CREATE DATABASE IF NOT EXISTS autocare_insight CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE autocare_insight');
    const [tables] = await connection.query('SHOW TABLES');
    if (!tables.length) {
      // Seed before triggers: historical payments/parts already have final states.
      await runSql(connection, '02_create_tables.sql');
      await runSql(connection, '05_sample_data.sql');
      await runSql(connection, '03_advanced_features.sql');
      await runSql(connection, 'advanced/01_views_demo.sql');
      await runSql(connection, 'advanced/02_stored_procedures_demo.sql');
      await runSql(connection, 'advanced/03_triggers_demo.sql');
    } else {
      console.log('Existing database detected; preserving tables and data.');
      const [routines] = await connection.query("SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE()");
      if (!routines.some(row => row.ROUTINE_NAME === 'sp_generate_invoice')) {
        throw new Error('Existing database is incomplete. Back it up and inspect it before rerunning SQL scripts. No tables were deleted.');
      }
    }
    await runSql(connection, '09_appointment_intake_photos.sql');
    // Upgrade only the invalid placeholder hashes supplied with sample data.
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await connection.execute("UPDATE users SET password_hash = ? WHERE password_hash LIKE '%placeholder%'", [hash]);
    const result = spawnSync(process.execPath, [path.join(root, 'database/import_csv_to_mysql.js')], { cwd: root, stdio: 'inherit', windowsHide: true });
    if (result.status !== 0) throw new Error('CSV import failed. Fix the error above and rerun setup.');
    await setupMongo(connection);
    console.log('Setup complete. Run npm run doctor, then npm run dev.');
  } finally { await connection.end(); }
}
main().catch(error => { console.error('Setup failed:', error.code || '', error.message); process.exitCode = 1; });
