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
// MONGODB CONNECTION - FIXED
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whitedaniel381_db_user:Gaivawhite2002@cluster0.sv0gy8y.mongodb.net/accommodation_finder?retryWrites=true&w=majority';

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Please check your MongoDB Atlas connection string and network access.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// ============================================
// USER MODEL
// ============================================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['student', 'landlord'], required: true },
  university: { type: String },
  propertyInfo: { type: String },
  isAdmin: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ============================================
// AUTH ROUTES - FIXED
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration attempt:', req.body.email);

    const { name, email, password, phone, userType, university, propertyInfo } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userData = { name, email, password: hashedPassword, phone, userType };
    if (userType === 'student') userData.university = university || 'Not specified';
    if (userType === 'landlord') userData.propertyInfo = propertyInfo || 'Not specified';

    const user = new User(userData);
    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ User registered successfully:', email);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        university: user.university,
        propertyInfo: user.propertyInfo
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_2024',
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in successfully:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        university: user.university,
        propertyInfo: user.propertyInfo,
        isAdmin: user.isAdmin || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'msa_yathu_secret_2024');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        university: user.university,
        propertyInfo: user.propertyInfo,
        isAdmin: user.isAdmin || false
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ============================================
// HOSTELS DATA
// ============================================
const hostels = [
  {
    id: 1,
    title: "Zomba Hills Student Lodge",
    price: 85000,
    location: "Chancellor College Area, Zomba",
    address: "Plot 12, Chancellor College Road",
    nearestUniversity: "University of Malawi (UNIMA)",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Beautiful lodge with scenic views of Zomba Plateau.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/unima-hostel-1.jpg"]
  },
  {
    id: 2,
    title: "Chancellor Court Apartments",
    price: 120000,
    location: "Chancellor College, Zomba",
    address: "Block B, Campus View Estate",
    nearestUniversity: "Chancellor College",
    distanceFromCampus: "300m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security"],
    description: "Modern apartments perfect for graduate students.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/unima-hostel-2.jpg"]
  },
  {
    id: 3,
    title: "MUBAS Student Residence",
    price: 95000,
    location: "Chichiri, Blantyre",
    address: "Plot 45, Chichiri, Blantyre",
    nearestUniversity: "Malawi University of Business and Applied Sciences (MUBAS)",
    distanceFromCampus: "1km",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished", "parking"],
    description: "Modern student residence near MUBAS campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/mubas-hostel-1.jpg"]
  },
  {
    id: 4,
    title: "Mzuzu University Student Hostel",
    price: 70000,
    location: "Luwinga, Mzuzu",
    address: "Area 3, Luwinga, Mzuzu",
    nearestUniversity: "Mzuzu University (MZUNI)",
    distanceFromCampus: "800m",
    roomType: "shared",
    amenities: ["wifi", "water_included", "security", "furnished"],
    description: "Affordable shared accommodation near Mzuzu University.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/mzuni-hostel-1.jpg"]
  },
  {
    id: 5,
    title: "LUANAR Student Hostel",
    price: 80000,
    location: "Bunda, Lilongwe",
    address: "Campus View, Bunda, Lilongwe",
    nearestUniversity: "Lilongwe University of Agriculture and Natural Resources (LUANAR)",
    distanceFromCampus: "400m",
    roomType: "single",
    amenities: ["wifi", "utilities_included", "furnished", "security"],
    description: "Premium hostel right next to LUANAR campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/luanar-hostel-1.jpg"]
  },
  {
    id: 6,
    title: "MUST Heights Apartments",
    price: 130000,
    location: "Thyolo, Near MUST",
    address: "Hilltop Estate, Thyolo",
    nearestUniversity: "Malawi University of Science and Technology (MUST)",
    distanceFromCampus: "800m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security", "water_included"],
    description: "Luxury apartments near MUST campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/must-hostel-1.jpg"]
  }
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
      login: '/api/auth/login',
      me: '/api/auth/me'
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
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Listings: http://localhost:${PORT}/api/listings`);
});