require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

// API endpoint to get all words
app.get('/api/words', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM words ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

// API endpoint to add a new word
app.post('/api/words', async (req, res) => {
  const { word } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  try {
    const [result] = await pool.query('INSERT INTO words (word) VALUES (?)', [word]);
    res.status(201).json({ id: result.insertId, word });
  } catch (err) {
    console.error('Error adding word:', err);
    res.status(500).json({ error: 'Failed to add word' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});