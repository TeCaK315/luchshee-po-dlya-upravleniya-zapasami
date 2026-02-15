import { Pool, PoolClient, QueryResult } from 'pg';
import { DatabaseConnection } from '@/types';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

class DatabaseConnectionImpl implements DatabaseConnection {
  private client: Pool | PoolClient;

  constructor(client: Pool | PoolClient) {
    this.client = client;
  }

  async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
    try {
      const result: QueryResult = await this.client.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async queryOne<T>(sql: string, params?: unknown[]): Promise<T | null> {
    try {
      const result: QueryResult = await this.client.query(sql, params);
      return result.rows.length > 0 ? (result.rows[0] as T) : null;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw error;
    }
  }

  async execute(sql: string, params?: unknown[]): Promise<void> {
    try {
      await this.client.query(sql, params);
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  }

  async transaction<T>(callback: (client: DatabaseConnection) => Promise<T>): Promise<T> {
    const poolClient = await getPool().connect();
    
    try {
      await poolClient.query('BEGIN');
      const transactionClient = new DatabaseConnectionImpl(poolClient);
      const result = await callback(transactionClient);
      await poolClient.query('COMMIT');
      return result;
    } catch (error) {
      await poolClient.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      poolClient.release();
    }
  }
}

export const db: DatabaseConnection = new DatabaseConnectionImpl(getPool());

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}