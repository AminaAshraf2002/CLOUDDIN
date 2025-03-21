// File: models/Admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
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
    required: true,
    minlength: 6
  },
  activeSession: {
    token: {
      type: String,
      default: null
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to get the single admin account
AdminSchema.statics.getAdmin = async function() {
  // This should always return only one document
  return this.findOne({});
};

// Method to update the admin's session information
AdminSchema.statics.updateSession = async function(token) {
  const admin = await this.findOne({});
  if (admin) {
    admin.activeSession = {
      token,
      lastLogin: new Date()
    };
    return admin.save();
  }
  return null;
};

// Method to clear the admin's session
AdminSchema.statics.clearSession = async function() {
  const admin = await this.findOne({});
  if (admin) {
    admin.activeSession = {
      token: null,
      lastLogin: null
    };
    return admin.save();
  }
  return null;
};

module.exports = mongoose.model('Admin', AdminSchema);