const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (MUST be first)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MSA Yathu API is running!',
    time: new Date().toISOString()
  });
});

// Test listings endpoint (temporary)
app.get('/api/listings', (req, res) => {
  res.json([
    { 
      id: 1, 
      title: 'Zomba Hills Lodge', 
      price: 85000, 
      location: 'Zomba',
      description: 'Beautiful lodge near Chancellor College'
    },
    { 
      id: 2, 
      title: 'MZUNI Student Lodge', 
      price: 65000, 
      location: 'Mzuzu',
      description: 'Affordable accommodation near Mzuzu University'
    }
  ]);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MSA Yathu API' });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ MSA Yathu API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});