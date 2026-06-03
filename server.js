const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://whitedaniel381_db_user:Gaivawhite2002@cluster0.sv0gy8y.mongodb.net/accommodation_finder?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  userType: { type: String, enum: ['student', 'landlord'], required: true },
  university: { type: String },
  propertyInfo: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MSA Yathu API is running!' });
});

// Complete hostels data for Malawi
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
    description: "Beautiful lodge with scenic views of Zomba Plateau. Walking distance to Chancellor College. Safe neighborhood with 24/7 security.",
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
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
    description: "Modern apartments perfect for graduate students. Fully furnished with private bathroom and kitchenette.",
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
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
    description: "Modern student residence near MUBAS campus. Secure environment with 24/7 security.",
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
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
    description: "Affordable shared accommodation within walking distance of Mzuzu University.",
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
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
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
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
    description: "Luxury apartments near MUST campus. Mountain views and modern amenities.",
    landlordName: "Gaiva",
    landlordEmail: "Whitedaniel381@gmail.com",
    landlordPhone: "0886606571",
    photos: ["/images/must-hostel-1.jpg"]
  }
];

// Get all listings
app.get('/api/listings', (req, res) => {
  res.json(hostels);
});

// Get single listing by ID
app.get('/api/listings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const hostel = hostels.find(h => h.id === id);
  if (hostel) {
    res.json(hostel);
  } else {
    res.status(404).json({ error: 'Hostel not found' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Listings: http://localhost:${PORT}/api/listings`);
});