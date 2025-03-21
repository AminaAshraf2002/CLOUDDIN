// File: middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get the admin (there should only be one)
      const admin = await Admin.getAdmin();
      
      // If no admin or token doesn't match the active session
      if (!admin || admin.activeSession.token !== token) {
        return res.status(401).json({ message: 'Invalid authentication' });
      }
      
      // Check if token is still within validity period (1 hour)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (admin.activeSession.lastLogin < hourAgo) {
        // Session expired, clear it
        await Admin.clearSession();
        
        return res.status(401).json({ message: 'Session expired. Please login again.' });
      }

      // Attach admin to request
      req.admin = admin;
      
      next();
    } catch (err) {
      // JWT verification failed
      return res.status(401).json({ message: 'Token is invalid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

module.exports = authMiddleware;