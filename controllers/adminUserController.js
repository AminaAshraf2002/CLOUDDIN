// controllers/adminUserController.js
const User = require('../models/User');

// Get all pending user registrations
exports.getPendingUsers = async (req, res) => {
  try {
    console.log('Fetching pending users');
    const pendingUsers = await User.find({ isApproved: false })
      .select('-password')
      .sort({ registrationDate: -1 });
    
    console.log(`Found ${pendingUsers.length} pending users`);
    res.json(pendingUsers);
  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({ 
      message: 'Server error fetching pending users',
      error: error.message 
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users');
    const users = await User.find()
      .select('-password')
      .sort({ registrationDate: -1 });
    
    console.log(`Found ${users.length} total users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Server error fetching users',
      error: error.message 
    });
  }
};

// Get user count (for dashboard)
exports.getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingUsers = await User.countDocuments({ isApproved: false });
    const approvedUsers = await User.countDocuments({ isApproved: true });
    
    console.log(`User counts - Total: ${totalUsers}, Pending: ${pendingUsers}, Approved: ${approvedUsers}`);
    
    res.json({
      totalUsers,
      pendingUsers,
      approvedUsers
    });
  } catch (error) {
    console.error('Error fetching user counts:', error);
    res.status(500).json({ 
      message: 'Server error fetching user counts',
      error: error.message 
    });
  }
};

// Get recent user registrations (for dashboard)
exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('-password')
      .sort({ registrationDate: -1 })
      .limit(5);
    
    console.log(`Fetched ${recentUsers.length} recent users`);
    res.json(recentUsers);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ 
      message: 'Server error fetching recent users',
      error: error.message 
    });
  }
};

// Approve a user - Improved version with atomic update
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Attempting to approve user with ID: ${userId}`);
    
    // Use findByIdAndUpdate for an atomic operation
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isApproved: true },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      console.log(`No user found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User approved successfully. User: ${updatedUser.name}, Email: ${updatedUser.email}, isApproved: ${updatedUser.isApproved}`);
    
    res.json({ 
      message: 'User approved successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isApproved: updatedUser.isApproved
      }
    });
  } catch (error) {
    console.error(`Error approving user ${req.params.userId}:`, error);
    res.status(500).json({ 
      message: 'Server error during user approval',
      error: error.message 
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Attempting to delete user with ID: ${userId}`);
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      console.log(`No user found with ID: ${userId} for deletion`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User deleted successfully. User: ${user.name}, Email: ${user.email}`);
    
    res.json({ 
      message: 'User deleted successfully',
      userId
    });
  } catch (error) {
    console.error(`Error deleting user ${req.params.userId}:`, error);
    res.status(500).json({ 
      message: 'Server error during user deletion',
      error: error.message 
    });
  }
};

// Check specific user status - New helper method for debugging
exports.checkUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Checking status for user ID: ${userId}`);
    
    const user = await User.findById(userId).select('name email isApproved');
    
    if (!user) {
      console.log(`No user found with ID: ${userId} for status check`);
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`Status check for ${user.name}: isApproved = ${user.isApproved}`);
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error(`Error checking user status for ${req.params.userId}:`, error);
    res.status(500).json({ message: 'Server error checking user status' });
  }
};