const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files (React app)
app.use(express.static(path.join(__dirname, 'public')));

// API to get list of music files
app.get('/api/music', (req, res) => {
  const musicDir = path.join(__dirname, 'music');
  fs.readdir(musicDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read music directory' });
    }
    res.json(files);
  });
});

// Serve music files
app.get('/api/music/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'music', req.params.filename);
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log("hduwhod")