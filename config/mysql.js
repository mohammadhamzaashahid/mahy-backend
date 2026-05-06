import dotenv from 'dotenv';
dotenv.config();
import mssql from 'mssql';
import mysql from 'mysql2/promise';

// const config = {
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   host: process.env.DB_SERVER,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 20,
//   queueLimit: 0
// };

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  socketPath: '/tmp/mysql.sock',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
};

let poolPromise = null;

async function createPool() {
  try {
    const pool = mysql.createPool(config);
    console.log('local mysql pool');
    pool.on('error', (err) => {
      console.error('sql pool rror:', err.message);
      poolPromise = null;
    });
    return pool;
  } catch (err) {
    console.error('error creating sql pool:', err.message);
    poolPromise = null;
    throw err;
  }
}

export const getPool = async () => {

  try {
    if (!poolPromise) {
      poolPromise = createPool();
    }

    const pool = await poolPromise;

    await pool.query('SELECT 1');

    return pool;
  } catch (err) {
    console.error('getPool error:', err.message);

    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.warn('Too many connections. Waiting before retrying...');
      await new Promise((r) => setTimeout(r, 3000)); 
      poolPromise = null;
      return await getPool(); 
    }

    poolPromise = null;
    throw err;
  }
};

export { mssql };