// File: controllers/authController.js
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin._id,
      email: admin.email
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get the admin account (there should only be one)
    const admin = await Admin.getAdmin();
    
    // If no admin exists or credentials don't match
    if (!admin || admin.email !== email) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(admin);
    
    // Update admin session
    await Admin.updateSession(token);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        name: admin.name,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    // Since there's only one admin, we can just fetch it directly
    const admin = await Admin.getAdmin();
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Don't send the password
    const adminData = {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt
    };

    res.json(adminData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Server error fetching profile',
      error: error.message 
    });
  }
};

// Logout Admin
exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the admin's session
    await Admin.clearSession();
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Server error during logout',
      error: error.message 
    });
  }
};