const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// REGISTER - Create a new user account
// ============================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, userType, university, propertyInfo } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !userType) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Validate userType
    if (userType !== 'student' && userType !== 'landlord') {
      return res.status(400).json({ 
        success: false,
        message: 'User type must be either student or landlord' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
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
        return res.status(400).json({ 
          success: false,
          message: 'University is required for students' 
        });
      }
      userData.university = university;
    }

    // Add landlord-specific field
    if (userType === 'landlord') {
      if (!propertyInfo) {
        return res.status(400).json({ 
          success: false,
          message: 'Property information is required for landlords' 
        });
      }
      userData.propertyInfo = propertyInfo;
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        userType: user.userType 
      },
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
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// ============================================
// LOGIN - Authenticate existing user
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        userType: user.userType 
      },
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
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// ============================================
// GET CURRENT USER - Validate token and get user info
// ============================================
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'msa_yathu_secret_key_2024');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
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
    res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
});

// ============================================
// GET ALL USERS - Admin only (for testing)
// ============================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// ============================================
// UPDATE USER - Update user profile
// ============================================
router.put('/update/:id', async (req, res) => {
  try {
    const { name, phone, university, propertyInfo } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (user.userType === 'student' && university) user.university = university;
    if (user.userType === 'landlord' && propertyInfo) user.propertyInfo = propertyInfo;

    await user.save();

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
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during update' 
    });
  }
});

module.exports = router;