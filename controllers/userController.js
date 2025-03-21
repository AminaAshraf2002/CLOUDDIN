// controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token for users
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      isApproved: user.isApproved
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1d' }
  );
};

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, courseName, courseId } = req.body;

    // Check if user already exists
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      courseName,
      courseId,
      isApproved: false // Default to not approved
    });

    // Save user
    await user.save();

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval by an administrator.',
      userId: user._id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Your account is pending approval by an administrator',
        isPending: true
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        courseName: user.courseName
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

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      message: 'Server error fetching profile',
      error: error.message 
    });
  }
};