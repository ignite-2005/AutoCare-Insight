require('./env');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const base = process.env.SMOKE_BASE_URL || 'http://localhost:3000';
let cookie = '';
let checks = 0;
async function request(route, options = {}, expected = 200) {
  const response = await fetch(base + route, {
    ...options, headers: { 'Content-Type': 'application/json', Cookie: cookie, ...options.headers },
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.json();
  assert.equal(response.status, expected, `${route}: ${JSON.stringify(body.error || body)}`);
  checks++;
  return { response, body };
}
async function login(email, password) {
  const { response } = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  cookie = response.headers.get('set-cookie').split(';')[0];
}
async function main() {
  await request('/api/customers', {}, 401);
  await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'admin@autocare.com', password: 'admin123' }) }, 401);
  await login('admin@autocare.com', 'password123');
  for (const route of ['/api/auth/me', '/api/customers', '/api/vehicles', '/api/catalogue', '/api/appointments', '/api/jobs', '/api/inventory', '/api/invoices', '/api/users', '/api/reports', '/api/reports/analytics', '/api/vehicles/1/history', '/api/jobs/1/parts', '/api/invoices/1', '/api/reports/1', '/api/search/semantic?q=brake%20grinding']) await request(route);
  const catalogue = (await request('/api/catalogue')).body.data;
  assert.deepEqual(catalogue.vehicles, catalogue.catalogue, 'Catalogue and vehicle picker must receive vehicle rows');
  assert.ok(catalogue.vehicles.length > 0);
  checks += 2;
  const stock = (await request('/api/inventory?low_stock=true')).body.data;
  assert.deepEqual(stock.parts, stock.inventory, 'Dashboard and parts picker must receive inventory rows');
  assert.ok(stock.parts.length > 0, 'Seed database should expose low stock');
  const analytics = (await request('/api/reports/analytics')).body.data;
  assert.deepEqual(analytics.systemBreakdown, analytics.analytics.system_breakdown);
  assert.ok(analytics.healthMetrics.totalReports >= 3, 'Dashboard needs live fleet metrics');
  checks += 4;
  for (const route of ['/api/advanced/sql-runner', '/api/advanced/mongodb-aggregations']) {
    const { body } = await request(route);
    for (const query of body.data.queries) await request(route, { method: 'POST', body: JSON.stringify({ query_id: query.id }) });
  }
  for (const page of ['/', '/login', '/dashboard', '/customers', '/vehicles', '/appointments', '/jobs', '/inventory', '/invoices', '/reports', '/catalogue', '/sql-runner', '/aggregations', '/search']) {
    const result = await fetch(base + page, { signal: AbortSignal.timeout(30000) });
    assert.equal(result.status, 200, page); checks++;
  }
  // Real report creation regression: BSON date, strict validator and SQL link.
  // Only this test's own temporary job/report are removed afterwards.
  const c = await mysql.createConnection({ host: process.env.MYSQL_HOST, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE });
  const mongo = new MongoClient(process.env.MONGODB_URI);
  let jobId;
  try {
    await mongo.connect();
    const [insert] = await c.execute("INSERT INTO service_jobs (vehicle_id, mechanic_id, status, odometer_in) VALUES (1, 4, 'assigned', 50000)");
    jobId = insert.insertId;
    await request('/api/reports', { method: 'POST', body: JSON.stringify({ job_id: jobId, vehicle_id: 1, mechanic_id: 4, created_at: new Date().toISOString(), findings: [{ system: 'Brakes', condition: 'Good' }], overall_health_score: 85 }) }, 201);
    const report = await mongo.db(process.env.MONGODB_DB_NAME).collection('repair_reports').findOne({ job_id: jobId });
    assert.ok(report.created_at instanceof Date, 'Report must store BSON date');
    const [linked] = await c.execute('SELECT mongo_report_id FROM service_jobs WHERE job_id = ?', [jobId]);
    assert.equal(linked[0].mongo_report_id, String(report._id)); checks += 2;
    await request('/api/reports', { method: 'POST', body: JSON.stringify({ job_id: jobId, vehicle_id: 1, mechanic_id: 4, overall_health_score: 85.5 }) }, 422);
  } finally {
    if (jobId) {
      await mongo.db(process.env.MONGODB_DB_NAME).collection('repair_reports').deleteOne({ job_id: jobId });
      await c.execute('DELETE FROM service_jobs WHERE job_id = ?', [jobId]);
    }
    await mongo.close(); await c.end();
  }
  await login('suresh@autocare.com', 'password123');
  await request('/api/invoices', {}, 403);
  await request('/api/jobs');
  await login('rajesh@autocare.com', 'password123');
  await request('/api/invoices');
  await request('/api/users', {}, 403);
  await request('/api/auth/logout', { method: 'POST' });
  cookie = '';
  await request('/api/auth/me', {}, 401);
  console.log(`PASS: ${checks} HTTP, page, authentication, role, query and report checks.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
