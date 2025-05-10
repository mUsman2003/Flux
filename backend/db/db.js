require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
});

// Function to clean up database
async function cleanupDatabase() {
  const client = await pool.connect();
  try {
    console.log('Cleaning up database...');
    await client.query('TRUNCATE TABLE songs RESTART IDENTITY CASCADE');
    console.log('Database cleaned up successfully');
  } catch (err) {
    console.error('Cleanup error:', err);
  } finally {
    client.release();
  }
}

// Handle server shutdown events
process.on('SIGINT', async () => {
  await cleanupDatabase();
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanupDatabase();
  await pool.end();
  process.exit(0);
});

// Add this helper function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function initializeDatabase(maxRetries = 10, retryDelay = 3000) {
  let attempts = 0;

  while (attempts < maxRetries) {
    const client = await pool.connect();
    try {
      console.log(`Attempt ${attempts + 1}: Connecting to PostgreSQL...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS songs (
          song_id SERIAL PRIMARY KEY,
          song_name TEXT NOT NULL,
          song_path TEXT NOT NULL UNIQUE
        );
      `);
      console.log('Songs table ready');

      const songsDir = path.join(__dirname, 'Music');
      if (fs.existsSync(songsDir)) {
        const files = fs.readdirSync(songsDir)
          .filter(file => path.extname(file).toLowerCase() === '.mp3')
          .map(file => ({
            name: path.basename(file, '.mp3'),
            path: path.join(songsDir, file),
          }));

        for (const song of files) {
          await client.query(
            `INSERT INTO songs (song_name, song_path)
             VALUES ($1, $2)
             ON CONFLICT (song_path) DO NOTHING`,
            [song.name, song.path]
          );
        }
        console.log(`Scanned ${files.length} songs`);
      }

      client.release();
      return; // Success! Exit retry loop
    } catch (err) {
      client.release();
      attempts++;
      console.error(`Initialization failed (attempt ${attempts}):`, err.message);
      if (attempts >= maxRetries) {
        console.error('Max retries reached. Exiting.');
        process.exit(1); // Crash the container (Kubernetes will restart it)
      }
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await sleep(retryDelay);
    }
  }
}

module.exports = {
  pool,
  initializeDatabase,
  cleanupDatabase // Export cleanup function if needed elsewhere
};