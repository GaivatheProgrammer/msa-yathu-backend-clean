const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// MONGODB CONNECTION
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whitedaniel381_db_user:Gaivawhite2002@cluster0.sv0gy8y.mongodb.net/accommodation_finder?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// ============================================
// USER MODEL - Defined ONCE here
// ============================================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['student', 'landlord'], required: true },
  university: { type: String, required: function() { return this.userType === 'student'; } },
  propertyInfo: { type: String, required: function() { return this.userType === 'landlord'; } },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ============================================
// AUTH ROUTES - Defined here to avoid separate file
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType, university, propertyInfo } = req.body;

    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = { name, email, password: hashedPassword, phone, userType };
    if (userType === 'student') {
      if (!university) return res.status(400).json({ message: 'University is required for students' });
      userData.university = university;
    }
    if (userType === 'landlord') {
      if (!propertyInfo) return res.status(400).json({ message: 'Property info is required for landlords' });
      userData.propertyInfo = propertyInfo;
    }

    const user = new User(userData);
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_2024',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.university && { university: user.university })
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_2024',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.university && { university: user.university })
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============================================
// HOSTELS DATA
// ============================================
const hostels = [
  { id: 1, title: "Zomba Hills Student Lodge", price: 85000, location: "Chancellor College Area, Zomba", nearestUniversity: "University of Malawi (UNIMA)", distanceFromCampus: "500m", roomType: "single", amenities: ["wifi", "security", "water_included", "furnished"], description: "Beautiful lodge near Chancellor College.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" },
  { id: 2, title: "Chancellor Court Apartments", price: 120000, location: "Chancellor College, Zomba", nearestUniversity: "Chancellor College", distanceFromCampus: "300m", roomType: "apartment", amenities: ["wifi", "utilities_included", "furnished", "parking", "security"], description: "Modern apartments for graduate students.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" },
  { id: 3, title: "MUBAS Student Residence", price: 95000, location: "Chichiri, Blantyre", nearestUniversity: "Malawi University of Business and Applied Sciences (MUBAS)", distanceFromCampus: "1km", roomType: "single", amenities: ["wifi", "security", "water_included", "furnished", "parking"], description: "Modern residence near MUBAS campus.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" },
  { id: 4, title: "Mzuzu University Student Hostel", price: 70000, location: "Luwinga, Mzuzu", nearestUniversity: "Mzuzu University (MZUNI)", distanceFromCampus: "800m", roomType: "shared", amenities: ["wifi", "water_included", "security", "furnished"], description: "Affordable shared accommodation near Mzuzu University.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" },
  { id: 5, title: "LUANAR Student Hostel", price: 80000, location: "Bunda, Lilongwe", nearestUniversity: "Lilongwe University of Agriculture and Natural Resources (LUANAR)", distanceFromCampus: "400m", roomType: "single", amenities: ["wifi", "utilities_included", "furnished", "security"], description: "Premium hostel next to LUANAR campus.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" },
  { id: 6, title: "MUST Heights Apartments", price: 130000, location: "Thyolo, Near MUST", nearestUniversity: "Malawi University of Science and Technology (MUST)", distanceFromCampus: "800m", roomType: "apartment", amenities: ["wifi", "utilities_included", "furnished", "parking", "security", "water_included"], description: "Luxury apartments near MUST campus.", landlordName: "Daniel White (Gaiva)", landlordEmail: "whitedaniel381@gmail.com", landlordPhone: "0886606571" }
];

// ============================================
// OTHER ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MSA Yathu API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/listings', (req, res) => {
  res.json(hostels);
});

app.get('/api/listings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hostel = hostels.find(h => h.id === id);
  if (hostel) {
    res.json(hostel);
  } else {
    res.status(404).json({ error: 'Hostel not found' });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MSA Yathu API is running!',
    endpoints: {
      health: '/api/health',
      listings: '/api/listings',
      register: '/api/auth/register',
      login: '/api/auth/login'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});