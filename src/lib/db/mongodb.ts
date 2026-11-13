import { MongoClient, Db, Collection } from 'mongodb';
import { DatabaseError } from './errors';
import { MongoRepairReport } from '../../types';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/autocare_db';
const dbName = process.env.MONGODB_DB_NAME || 'autocare_db';

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = global as unknown as GlobalWithMongo;

function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      ignoreUndefined: true,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000
    });
    const pending = client.connect();
    globalWithMongo._mongoClientPromise = pending;
    // A failed first connection must not poison every later request in this instance.
    void pending.catch(() => {
      if (globalWithMongo._mongoClientPromise === pending) {
        delete globalWithMongo._mongoClientPromise;
      }
    });
  }
  return globalWithMongo._mongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  try {
    // Connect only for database requests, never while importing routes during a build.
    const client = await getMongoClientPromise();
    return client.db(dbName);
  } catch (err: any) {
    console.error('[MongoDB Connection Failure] Database connection unavailable');
    throw new DatabaseError('MongoDB service currently unavailable', 'MONGO_CONNECTION_FAILURE');
  }
}

export async function getRepairReportsCollection(): Promise<Collection<MongoRepairReport>> {
  const db = await getMongoDb();
  return db.collection<MongoRepairReport>('repair_reports');
}

