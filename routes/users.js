const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');


router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, university, propertyInfo } = req.body;
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (user.userType === 'student' && university) user.university = university;
    if (user.userType === 'landlord' && propertyInfo) user.propertyInfo = propertyInfo;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: user.toObject() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;