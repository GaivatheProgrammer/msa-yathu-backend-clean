const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Initialize app FIRST
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// THEN import routes
const authRoutes = require('./routes/auth');

// THEN use routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MSA Yathu API is running!' });
});

// Test listings
app.get('/api/listings', (req, res) => {
  res.json([
    { id: 1, title: 'Zomba Hills Lodge', price: 85000, location: 'Zomba' },
    { id: 2, title: 'MZUNI Student Lodge', price: 65000, location: 'Mzuzu' }
  ]);
});

// MongoDB connection (optional - if you have MongoDB)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accommodation_finder';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}/api/health`);
});