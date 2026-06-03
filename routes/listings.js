const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  },
});

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      university,
      minPrice,
      maxPrice,
      location,
      roomType,
      amenities,
      maxDistance,
      sortBy,
      order,
    } = req.query;

    let query = { isActive: true };

    if (university) {
      query.nearestUniversity = university;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (roomType) {
      query.roomType = roomType;
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    if (maxDistance) {
      // This is a simplified version - in production you'd want proper distance calculation
      query.distanceFromCampus = { $lte: maxDistance };
    }

    let listingsQuery = Listing.find(query).populate('landlordId', 'name email phone');

    // Apply sorting
    if (sortBy === 'price') {
      const sortOrder = order === 'desc' ? -1 : 1;
      listingsQuery = listingsQuery.sort({ price: sortOrder });
    } else if (sortBy === 'distance') {
      // Convert distance strings to numbers for sorting (simplified)
      listingsQuery = listingsQuery.sort({ distanceFromCampus: 1 });
    } else if (sortBy === 'newest') {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    } else {
      listingsQuery = listingsQuery.sort({ createdAt: -1 });
    }

    const listings = await listingsQuery;
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('landlordId', 'name email phone');
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create listing (landlord only)
router.post('/', auth, upload.array('photos', 10), async (req, res) => {
  try {
    if (req.user.userType !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can create listings' });
    }

    const {
      title,
      price,
      location,
      address,
      nearestUniversity,
      distanceFromCampus,
      roomType,
      amenities,
      description,
      landlordName,
      landlordEmail,
      landlordPhone,
    } = req.body;

    // Validate required fields
    const requiredFields = ['title', 'price', 'location', 'address', 'nearestUniversity', 
                           'distanceFromCampus', 'roomType', 'description', 
                           'landlordName', 'landlordEmail', 'landlordPhone'];
    
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    const photoPaths = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const listing = new Listing({
      landlordId: req.user.id,
      landlordName,
      landlordEmail,
      landlordPhone,
      title,
      price,
      location,
      address,
      nearestUniversity,
      distanceFromCampus,
      roomType,
      amenities: amenities ? amenities.split(',') : [],
      description,
      photos: photoPaths,
    });

    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update listing
router.put('/:id', auth, upload.array('photos', 10), async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };
    
    if (req.files && req.files.length > 0) {
      updateData.photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    if (req.body.amenities) {
      updateData.amenities = req.body.amenities.split(',');
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json(updatedListing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete listing
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.landlordId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get landlord's listings
router.get('/landlord/my-listings', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'landlord') {
      return res.status(403).json({ message: 'Only landlords can access this endpoint' });
    }

    const listings = await Listing.find({ landlordId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;