const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['student', 'landlord'],
    required: true
  },
  university: {
    type: String,
    required: function() { return this.userType === 'student'; }
  },
  propertyInfo: {
    type: String,
    required: function() { return this.userType === 'landlord'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);