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

console.log('Connecting to MongoDB...');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

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
// AUTH ROUTES
// ============================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType, university, propertyInfo } = req.body;

    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = { name, email, password: hashedPassword, phone, userType };
    if (userType === 'student') userData.university = university || 'Not specified';
    if (userType === 'landlord') userData.propertyInfo = propertyInfo || 'Not specified';

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

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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

// Get all users (admin only)
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================
// HOSTELS DATA (In-Memory Storage)
// ============================================
let hostels = [
  // === PUBLIC UNIVERSITIES ===
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
    description: "Beautiful lodge with scenic views of Zomba Plateau. Walking distance to Chancellor College.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/unima-hostel-1.jpg"],
    createdAt: new Date('2024-01-01')
  },
  {
    id: 2,
    title: "Chancellor Court Apartments",
    price: 120000,
    location: "Chancellor College, Zomba",
    address: "Block B, Campus View Estate",
    nearestUniversity: "University of Malawi (UNIMA)",
    distanceFromCampus: "300m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security"],
    description: "Modern apartments perfect for graduate students. Fully furnished.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/unima-hostel-2.jpg"],
    createdAt: new Date('2024-01-15')
  },
  {
    id: 3,
    title: "MZUNI Student Lodge",
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
    photos: ["/images/mzuni-hostel-1.jpg"],
    createdAt: new Date('2024-02-01')
  },
  {
    id: 4,
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
    photos: ["/images/luanar-hostel-1.jpg"],
    createdAt: new Date('2024-02-15')
  },
  {
    id: 5,
    title: "MUST Heights Apartments",
    price: 130000,
    location: "Thyolo, Near MUST",
    address: "Hilltop Estate, Thyolo",
    nearestUniversity: "Malawi University of Science and Technology (MUST)",
    distanceFromCampus: "800m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security", "water_included"],
    description: "Luxury apartments near MUST campus. Mountain views.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/must-hostel-1.jpg"],
    createdAt: new Date('2024-03-01')
  },
  {
    id: 6,
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
    photos: ["/images/mubas-hostel-1.jpg"],
    createdAt: new Date('2024-03-15')
  },
  {
    id: 7,
    title: "Medical Students Quarters - KUHeS",
    price: 90000,
    location: "Blantyre, Near QECH",
    address: "Queens Hospital Road, Blantyre",
    nearestUniversity: "Kamuzu University of Health Sciences (KUHeS)",
    distanceFromCampus: "200m",
    roomType: "single",
    amenities: ["wifi", "utilities_included", "furnished", "security", "water_included"],
    description: "Safe and secure hostel for medical students. Close to teaching hospital.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/kuhes-hostel-1.jpg"],
    createdAt: new Date('2024-04-01')
  },
  // === PRIVATE UNIVERSITIES ===
  {
    id: 8,
    title: "Catholic University Guest House",
    price: 85000,
    location: "Montfort, Lilongwe",
    address: "Along M1 Road, Montfort",
    nearestUniversity: "Catholic University of Malawi",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Comfortable accommodation near Catholic University. Quiet and secure.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/catholic-hostel.jpg"],
    createdAt: new Date('2024-04-15')
  },
  {
    id: 9,
    title: "BIU Student Lodge",
    price: 85000,
    location: "Blantyre, Near BIU",
    address: "Mount Pleasant, Blantyre",
    nearestUniversity: "Blantyre International University",
    distanceFromCampus: "300m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished", "parking"],
    description: "Modern student residence near BIU campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/biu-hostel.jpg"],
    createdAt: new Date('2024-05-01')
  },
  {
    id: 10,
    title: "Livingstonia University Hostel",
    price: 75000,
    location: "Livingstonia, Mzuzu",
    address: "Near Livingstonia Campus",
    nearestUniversity: "Livingstonia University",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Convenient hostel for Livingstonia University students.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/livingstonia-hostel.jpg"],
    createdAt: new Date('2024-05-15')
  }
];

// ============================================
// LISTINGS ROUTES (GET, POST, PUT, DELETE)
// ============================================

// GET all listings
app.get('/api/listings', (req, res) => {
  res.json(hostels);
});

// GET single listing by ID
app.get('/api/listings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hostel = hostels.find(h => h.id === id);
  if (hostel) {
    res.json(hostel);
  } else {
    res.status(404).json({ error: 'Hostel not found' });
  }
});

// GET landlord's listings (by email)
app.get('/api/listings/landlord/:email', (req, res) => {
  const email = req.params.email;
  const landlordListings = hostels.filter(h => h.landlordEmail === email);
  res.json(landlordListings);
});

// POST - Create new listing (Landlord)
app.post('/api/listings', async (req, res) => {
  try {
    const { 
      title, price, location, address, nearestUniversity, 
      distanceFromCampus, roomType, amenities, description,
      landlordName, landlordEmail, landlordPhone 
    } = req.body;

    // Validate required fields
    if (!title || !price || !location || !address || !nearestUniversity || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be filled' 
      });
    }

    // Create new hostel
    const newHostel = {
      id: hostels.length + 1,
      title,
      price: parseInt(price),
      location,
      address,
      nearestUniversity,
      distanceFromCampus: distanceFromCampus || 'Not specified',
      roomType: roomType || 'single',
      amenities: amenities || [],
      description,
      landlordName: landlordName || 'Landlord',
      landlordEmail: landlordEmail || 'landlord@example.com',
      landlordPhone: landlordPhone || 'N/A',
      photos: ['/images/placeholder.jpg'],
      createdAt: new Date()
    };

    hostels.push(newHostel);
    console.log('✅ New hostel added:', newHostel.title);

    res.status(201).json({ 
      success: true, 
      message: 'Hostel listed successfully!',
      hostel: newHostel
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT - Update listing (Landlord)
app.put('/api/listings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = hostels.findIndex(h => h.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const updatedHostel = {
      ...hostels[index],
      ...req.body,
      id: hostels[index].id,
      price: req.body.price ? parseInt(req.body.price) : hostels[index].price,
      updatedAt: new Date()
    };

    hostels[index] = updatedHostel;
    console.log('✅ Hostel updated:', updatedHostel.title);

    res.json({ 
      success: true, 
      message: 'Hostel updated successfully!',
      hostel: updatedHostel
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE - Delete listing (Landlord)
app.delete('/api/listings/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = hostels.findIndex(h => h.id === id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    const deletedHostel = hostels[index];
    hostels.splice(index, 1);
    console.log('✅ Hostel deleted:', deletedHostel.title);

    res.json({ 
      success: true, 
      message: 'Hostel deleted successfully!',
      hostel: deletedHostel
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

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

app.get('/', (req, res) => {
  res.json({
    message: 'MSA Yathu API is running!',
    endpoints: {
      health: '/api/health',
      listings: '/api/listings',
      register: '/api/auth/register',
      login: '/api/auth/login',
      me: '/api/auth/me',
      users: '/api/auth/users'
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
})