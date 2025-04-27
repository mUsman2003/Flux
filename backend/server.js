const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Your React app's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  credentials: true // If you need cookies/auth
}));

// Initialize database when starting server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// API endpoint
app.get('/api/songs', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT song_id as id, song_name as name, song_path as path
      FROM songs 
      ORDER BY song_name
    `);
    
    // Format the response to match your frontend needs
    const songs = result.rows.map(song => ({
      id: song.id,
      name: song.name,
      path: song.path
      // Add any other properties you need for filtering
    }));
    
    res.json(songs); // Returns array directly to match your frontend expectation
    
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch songs',
      details: err.message 
    });
  }
});

// Add to your server.js
const fs = require('fs');
const path = require('path');

app.get('/api/songs/:id/file', async (req, res) => {
  try {
    // Get song path from database
    const result = await pool.query(
      'SELECT song_path FROM songs WHERE song_id = $1', 
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).send('Song not found');
    }

    const filePath = result.rows[0].song_path;
    
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Audio file not found');
    }

    // Stream the file
    res.sendFile(path.resolve(filePath));
    
  } catch (err) {
    console.error('File serve error:', err);
    res.status(500).send('Error serving audio file');
  }
});