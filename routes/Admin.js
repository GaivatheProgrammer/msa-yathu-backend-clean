const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Setup - Create first admin
router.post('/setup', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(403).json({ message: 'Admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const admin = new Admin({
      name: 'Gaiva',
      email: 'admin@hostelhub.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true
    });
    
    await admin.save();
    res.json({ message: 'Admin created successfully', email: 'admin@hostelhub.com', password: 'Admin@123' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;