require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests

// Sample API Route
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users;');
    console.log("Query Result:", result.rows);  // Logs query output to console
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: 'Database error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
