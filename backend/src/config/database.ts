import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'merlot_vip',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export const initDatabase = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Run schema
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    
    console.log('✅ Database schema initialized');
    client.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.log('\n📋 Make sure PostgreSQL is running and database exists:');
    console.log('   createdb merlot_vip\n');
    process.exit(1);
  }
};

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Query executed:', { text: text.substring(0, 100), duration: `${duration}ms`, rows: result.rowCount });
  }
  
  return result;
};

export default pool;
