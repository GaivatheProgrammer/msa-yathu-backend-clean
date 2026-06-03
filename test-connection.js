const mongoose = require('mongoose');

// Your MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://whitedaniel381_db_user:Gaivawhite2002@cluster0.sv0gy8y.mongodb.net/accommodation_finder?retryWrites=true&w=majority';

async function testConnection() {
  console.log('🔌 Attempting to connect to MongoDB Atlas...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('📊 Database is ready for deployment.');
    
    // Check if listings exist
    if (mongoose.connection.db) {
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log(`📁 Collections: ${collections.map(c => c.name).join(', ')}`);
      
      const listings = await db.collection('listings').countDocuments();
      console.log(`🏠 Total hostels in database: ${listings}`);
    }
    
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error message:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Fix: Wrong password. Check your password in the connection string.');
    } else if (error.message.includes('IP address')) {
      console.log('\n💡 Fix: Add your IP to MongoDB Atlas whitelist:');
      console.log('   1. Go to MongoDB Atlas');
      console.log('   2. Click Network Access');
      console.log('   3. Add IP address: 0.0.0.0/0');
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testConnection();