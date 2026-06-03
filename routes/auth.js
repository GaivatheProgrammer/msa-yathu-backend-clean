const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType, university, propertyInfo } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Validate userType
    if (userType !== 'student' && userType !== 'landlord') {
      return res.status(400).json({ message: 'User type must be either student or landlord' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      phone,
      userType,
    };

    // Add student-specific field
    if (userType === 'student') {
      if (!university) {
        return res.status(400).json({ message: 'University is required for students' });
      }
      userData.university = university;
    }

    // Add landlord-specific field
    if (userType === 'landlord') {
      if (!propertyInfo) {
        return res.status(400).json({ message: 'Property info is required for landlords' });
      }
      userData.propertyInfo = propertyInfo;
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Return user info (excluding password)
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.university && { university: user.university }),
        ...(user.propertyInfo && { propertyInfo: user.propertyInfo })
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'msa_yathu_secret_key_2024',
      { expiresIn: '7d' }
    );

    // Return user info (excluding password)
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.university && { university: user.university }),
        ...(user.propertyInfo && { propertyInfo: user.propertyInfo })
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get Current User (for token validation)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'msa_yathu_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        ...(user.university && { university: user.university }),
        ...(user.propertyInfo && { propertyInfo: user.propertyInfo })
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;