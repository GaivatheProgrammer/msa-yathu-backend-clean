const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  landlordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false  // Changed from true to false
  },
  landlordName: {
    type: String,
    required: true,
  },
  landlordEmail: {
    type: String,
    required: true,
  },
  landlordPhone: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  nearestUniversity: {
    type: String,
    required: true,
  },
  distanceFromCampus: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    enum: ['single', 'shared', 'apartment', 'studio'],
    required: true,
  },
  amenities: [{
    type: String,
    enum: ['wifi', 'utilities_included', 'furnished', 'parking', 'security', 'water_included'],
  }],
  description: {
    type: String,
    required: true,
  },
  photos: [{
    type: String,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

listingSchema.index({ price: 1, distanceFromCampus: 1, nearestUniversity: 1 });

module.exports = mongoose.model('Listing', listingSchema);