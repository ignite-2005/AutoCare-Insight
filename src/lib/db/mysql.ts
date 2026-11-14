import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { DatabaseError, ConflictError, ValidationError } from './errors';
import { mysqlTlsOptions } from './mysql-tls';
import { mysqlTimezone } from './mysql-timezone';
import type { Pool as CallbackPool, PoolConnection as CallbackPoolConnection } from 'mysql2';

// Next.js reloads route modules during development. Keep one pool per process,
// rather than abandoning open connections whenever a module is re-evaluated.
const globalWithMySql = globalThis as typeof globalThis & { _autoCareMySqlPool?: Pool };

export function getMySqlPool(): Pool {
  if (!globalWithMySql._autoCareMySqlPool) {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'autocare_insight';
    const connectionLimit = Number(process.env.MYSQL_CONNECTION_LIMIT) || 10;
    const { timezone, sessionTimeZone } = mysqlTimezone();

    globalWithMySql._autoCareMySqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      namedPlaceholders: true,
      timezone,
      ...mysqlTlsOptions(),
    });
    if (sessionTimeZone) {
      const callbackPool = (globalWithMySql._autoCareMySqlPool as Pool & { pool: CallbackPool }).pool;
      callbackPool.on('connection', (connection: CallbackPoolConnection) => {
        // Queue this before the connection's first application query. Never use
        // a connection with a mismatched workshop clock after initialization fails.
        connection.query('SET time_zone = ?', [sessionTimeZone], error => {
          if (error) connection.destroy();
        });
      });
    }
  }
  return globalWithMySql._autoCareMySqlPool;
}

export function handleMySqlError(err: any): never {
  const code = err.code || err.sqlState || 'UNKNOWN';

  // Specific MySQL error mapping
  if (code === 'ER_DUP_ENTRY') {
    throw new ConflictError(err.message || 'Duplicate entry exists');
  }
  if (code === 'ER_NO_REFERENCED_ROW_2') {
    throw new ValidationError('Referenced record does not exist in the database');
  }
  if (code === 'ER_ROW_IS_REFERENCED_2') {
    throw new ConflictError('Cannot delete record because related records depend on it');
  }
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ER_ACCESS_DENIED_ERROR') {
    console.error(`[MySQL Connection Failure] code=${code}`);
    throw new DatabaseError('Database service currently unavailable', 'DB_CONNECTION_FAILURE');
  }

  console.error(`[MySQL Error] code=${code} message=${err.message}`);
  throw new DatabaseError(err.message || 'Database query failed', code);
}

/**
 * Execute a query that returns multiple rows
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const p = getMySqlPool();
  try {
    const [rows] = await p.execute<RowDataPacket[] & T[]>(sql, params);
    return rows as T[];
  } catch (err: any) {
    return handleMySqlError(err);
  }
}

/**
 * Execute a query that returns at most one row
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT, UPDATE, or DELETE statement
 */
export async function execute(sql: string, params: any[] = []): Promise<ResultSetHeader> {
  const p = getMySqlPool();
  try {
    const [result] = await p.execute<ResultSetHeader>(sql, params);
    return result;
  } catch (err: any) {
    return handleMySqlError(err);
  }
}
