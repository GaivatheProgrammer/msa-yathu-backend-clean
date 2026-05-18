const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MSA Yathu API is running!' });
});

// Test listings endpoint
app.get('/api/listings', (req, res) => {
  res.json([
    { id: 1, title: 'Zomba Hills Lodge', price: 85000, location: 'Zomba' },
    { id: 2, title: 'MZUNI Student Lodge', price: 65000, location: 'Mzuzu' }
  ]);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});