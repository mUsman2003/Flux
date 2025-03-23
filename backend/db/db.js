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

// Function to create the songs table if it doesn't exist
async function createSongsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS songs (
      song_id SERIAL PRIMARY KEY,
      song_name TEXT NOT NULL,
      song_path TEXT NOT NULL UNIQUE -- Add UNIQUE constraint to song_path
    );
  `;
  await pool.query(query);
  console.log('Songs table created or already exists.');
}

// Function to read MP3 files from the songs folder
function getMp3Files() {
  const songsDir = path.join(__dirname, 'Music');
  const files = fs.readdirSync(songsDir);
  return files
    .filter(file => path.extname(file).toLowerCase() === '.mp3')
    .map(file => ({
      name: path.basename(file, '.mp3'),
      path: path.join(songsDir, file),
    }));
}

// Function to insert songs into the database
async function insertSongs(songs) {
  const query = `
    INSERT INTO songs (song_name, song_path)
    VALUES ($1, $2)
    ON CONFLICT (song_path) DO NOTHING; -- Use song_path for conflict resolution
  `;
  for (const song of songs) {
    await pool.query(query, [song.name, song.path]);
  }
  console.log('Songs inserted or already exist.');
}

// Main function to execute the steps
async function main() {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL');

    await createSongsTable();
    const songs = getMp3Files();
    await insertSongs(songs);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

main();