const express = require('express');
const cors = require('cors');
const { pool, initializeDatabase } = require('./db/db');
const songsRoutes = require('./routes/songs'); // Import routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use('/api/songs', songsRoutes); // Mount songs routes

// Start the server after initializing DB
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
