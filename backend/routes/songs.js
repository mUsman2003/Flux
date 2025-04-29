// routes/songs.js

const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');
const fs = require('fs');
const path = require('path');

// GET /api/songs - Fetch all songs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT song_id as id, song_name as name, song_path as path
      FROM songs 
      ORDER BY song_name
    `);

    const songs = result.rows.map(song => ({
      id: song.id,
      name: song.name,
      path: song.path
    }));

    res.json(songs);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: 'Failed to fetch songs',
      details: err.message
    });
  }
});

// GET /api/songs/:id/file - Serve audio file
router.get('/:id/file', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT song_path FROM songs WHERE song_id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Song not found');
    }

    const filePath = result.rows[0].song_path;

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Audio file not found');
    }

    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error('File serve error:', err);
    res.status(500).send('Error serving audio file');
  }
});

module.exports = router;
