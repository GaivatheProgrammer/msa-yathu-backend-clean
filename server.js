const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Use IP-based string to avoid DNS issues
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://whitedaniel381_db_user:Gaivawhite2002@cluster0-shard-00-00.sv0gy8y.mongodb.net:27017,cluster0-shard-00-01.sv0gy8y.mongodb.net:27017,cluster0-shard-00-02.sv0gy8y.mongodb.net:27017/accommodation_finder?ssl=true&replicaSet=atlas-sv0gy8y-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// Routes - IMPORT AFTER MODELS
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MSA Yathu API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Hostels data
const hostels = [
  {
    id: 1,
    title: "Zomba Hills Student Lodge",
    price: 85000,
    location: "Chancellor College Area, Zomba",
    nearestUniversity: "University of Malawi (UNIMA)",
    distanceFromCampus: "500m",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished"],
    description: "Beautiful lodge near Chancellor College.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  },
  {
    id: 2,
    title: "Chancellor Court Apartments",
    price: 120000,
    location: "Chancellor College, Zomba",
    nearestUniversity: "Chancellor College",
    distanceFromCampus: "300m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security"],
    description: "Modern apartments for graduate students.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  },
  {
    id: 3,
    title: "MUBAS Student Residence",
    price: 95000,
    location: "Chichiri, Blantyre",
    nearestUniversity: "Malawi University of Business and Applied Sciences (MUBAS)",
    distanceFromCampus: "1km",
    roomType: "single",
    amenities: ["wifi", "security", "water_included", "furnished", "parking"],
    description: "Modern residence near MUBAS campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  },
  {
    id: 4,
    title: "Mzuzu University Student Hostel",
    price: 70000,
    location: "Luwinga, Mzuzu",
    nearestUniversity: "Mzuzu University (MZUNI)",
    distanceFromCampus: "800m",
    roomType: "shared",
    amenities: ["wifi", "water_included", "security", "furnished"],
    description: "Affordable shared accommodation near Mzuzu University.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  },
  {
    id: 5,
    title: "LUANAR Student Hostel",
    price: 80000,
    location: "Bunda, Lilongwe",
    nearestUniversity: "Lilongwe University of Agriculture and Natural Resources (LUANAR)",
    distanceFromCampus: "400m",
    roomType: "single",
    amenities: ["wifi", "utilities_included", "furnished", "security"],
    description: "Premium hostel next to LUANAR campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  },
  {
    id: 6,
    title: "MUST Heights Apartments",
    price: 130000,
    location: "Thyolo, Near MUST",
    nearestUniversity: "Malawi University of Science and Technology (MUST)",
    distanceFromCampus: "800m",
    roomType: "apartment",
    amenities: ["wifi", "utilities_included", "furnished", "parking", "security", "water_included"],
    description: "Luxury apartments near MUST campus.",
    landlordName: "Daniel White (Gaiva)",
    landlordEmail: "whitedaniel381@gmail.com",
    landlordPhone: "0886606571"
  }
];

// Listings routes
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Listings: http://localhost:${PORT}/api/listings`);
});