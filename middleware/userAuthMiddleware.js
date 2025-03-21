// middleware/userAuthMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Your account has not been approved yet',
        isPending: true
      });
    }

    // Attach user ID and user object to request
    req.userId = decoded.id;
    req.user = user;

    next();
  } catch (error) {
    console.error('User auth middleware error:', error);
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = userAuthMiddleware;