const express = require('express');
const path = require('path');
const cors = require('cors');
const { initDb, incrementAndGet } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint
app.get('/api/visits', async (req, res) => {
  try {
    const count = await incrementAndGet();
    res.json({ visits: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.send('OK good');
});

(async () => {
  try {
    await initDb();
    app.listen(PORT,"0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to init DB', err);
    process.exit(1); 
  }
})();
