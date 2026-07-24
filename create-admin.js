const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://whitedaniel381_db_user:Gaivawhite2002@cluster0.sv0gy8y.mongodb.net/accommodation_finder';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  userType: String,
  propertyInfo: String,
  isAdmin: Boolean,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'whitedaniel381@gmail.com' });
    if (existingUser) {
      console.log('User already exists, updating to admin...');
      await User.updateOne(
        { email: 'whitedaniel381@gmail.com' },
        { $set: { isAdmin: true, role: 'super_admin' } }
      );
      console.log('✅ Updated existing user to admin');
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('Gaivawhite2002', 10);

      const admin = new User({
        name: 'Daniel White',
        email: 'whitedaniel381@gmail.com',
        password: hashedPassword,
        phone: '0886606571',
        userType: 'landlord',
        propertyInfo: 'Platform Administrator - Managing MSA Yathu',
        isAdmin: true,
        role: 'super_admin',
        createdAt: new Date()
      });

      await admin.save();
      console.log('✅ Admin created successfully!');
    }

    console.log('\n📝 Admin Login Credentials:');
    console.log('   Email: whitedaniel381@gmail.com');
    console.log('   Password: Gaivawhite2002');
    console.log('\n🔗 Login URL: https://msa-yathu1.netlify.app/login');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();