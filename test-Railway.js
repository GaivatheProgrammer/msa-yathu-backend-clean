const mongoose = require('mongoose');

// Your public Railway connection string
const MONGODB_URI = 'mongodb://mongo:VYdAahNkUknGwnXahiMMCsvMmwcaDwHp@turntable.proxy.rlwy.net:19739/accommodation_finder';

async function testConnection() {
  console.log(' Testing Railway MongoDB public connection...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to Railway MongoDB!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(' Connected to database successfully!');
    
    // Check if we have listings
    const listings = await db.collection('listings').countDocuments();
    console.log(`🏠 Total hostels in database: ${listings}`);
    
  } catch (error) {
    console.error(' Connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();