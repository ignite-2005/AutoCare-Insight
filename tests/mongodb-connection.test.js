require('./register-typescript.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MongoClient } = require('mongodb');

test('MongoDB import is offline-safe, concurrent requests share a connection, and a failed connection can recover', async (t) => {
  const modulePath = require.resolve('../src/lib/db/mongodb.ts');
  const originalConnect = MongoClient.prototype.connect;
  const originalError = console.error;
  const previousUri = process.env.MONGODB_URI;
  const previousDatabase = process.env.MONGODB_DB_NAME;
  let attempts = 0;
  let fail = true;
  const clients = [];
  const errors = [];
  process.env.MONGODB_URI = 'mongodb://localhost:27017';
  process.env.MONGODB_DB_NAME = 'connection_recovery_test';
  delete require.cache[modulePath];
  delete globalThis._mongoClientPromise;
  MongoClient.prototype.connect = async function () {
    attempts++;
    clients.push(this);
    await Promise.resolve();
    if (fail) throw new Error('private-provider-connection-details');
    return this;
  };
  console.error = (...values) => errors.push(values.join(' '));
  t.after(async () => {
    MongoClient.prototype.connect = originalConnect;
    console.error = originalError;
    delete require.cache[modulePath];
    delete globalThis._mongoClientPromise;
    if (previousUri === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previousUri;
    if (previousDatabase === undefined) delete process.env.MONGODB_DB_NAME; else process.env.MONGODB_DB_NAME = previousDatabase;
    for (const client of clients) await client.close();
  });

  const { getMongoDb } = require(modulePath);
  assert.equal(attempts, 0, 'importing a route must not start a database connection');
  const failed = await Promise.allSettled([getMongoDb(), getMongoDb()]);
  assert.equal(attempts, 1, 'concurrent requests should share the in-flight connection');
  for (const result of failed) {
    assert.equal(result.status, 'rejected');
    assert.equal(result.reason.code, 'MONGO_CONNECTION_FAILURE');
    assert.equal(result.reason.message, 'MongoDB service currently unavailable');
  }
  assert.ok(errors.length > 0);
  assert.ok(errors.every(value => !value.includes('private-provider-connection-details')));
  fail = false;
  const [first, second] = await Promise.all([getMongoDb(), getMongoDb()]);
  assert.equal(attempts, 2, 'a later request should retry instead of reusing a rejected promise');
  assert.equal(first.databaseName, 'connection_recovery_test');
  assert.equal(second.client, first.client);
  assert.equal(first.client.options.minPoolSize, 0);
});
