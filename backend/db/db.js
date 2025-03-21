require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE, // Matches `.env`
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => console.log('Connected to PostgreSQL 17'))
  .catch(err => console.error('Connection error:', err));

module.exports = pool;
