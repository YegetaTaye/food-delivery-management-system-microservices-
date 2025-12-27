import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { config } from './env';
import logger from '../utils/logger';

let pool: Pool | null = null;

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Create connection pool
    pool = mysql.createPool({
      host: config.mysql.host,
      port: config.mysql.port,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    logger.info('✅ MySQL connection established successfully');
    
    // Create delivery table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS delivery (
        id VARCHAR(36) PRIMARY KEY,
        orderId VARCHAR(255) NOT NULL UNIQUE,
        status ENUM('ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
        assignedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orderId (orderId),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    logger.info('✅ Delivery table ensured');
    connection.release();
  } catch (error) {
    logger.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

export const getConnection = async (): Promise<PoolConnection> => {
  const dbPool = getPool();
  return dbPool.getConnection();
};

export const query = async <T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: unknown[]
): Promise<T> => {
  const dbPool = getPool();
  const [results] = await dbPool.query<T>(sql, params);
  return results;
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL connection pool closed');
  }
};

