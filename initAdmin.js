// File: initAdmin.js
/**
 * This script initializes the admin account in the database.
 * It should be run once when setting up the application.
 * It reads admin credentials from environment variables.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Database connection
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB for admin initialization"))
.catch((err) => {
  console.error("DB Connection failed:");
  console.error(err);
  process.exit(1);
});

const initializeAdmin = async () => {
  try {
    // Check if any admin already exists
    const adminCount = await Admin.countDocuments();
    
    if (adminCount > 0) {
      const existingAdmin = await Admin.findOne({});
      console.log('Admin account already exists:');
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Email: ${existingAdmin.email}`);
      
      // Update admin if FORCE_UPDATE is set
      if (process.env.FORCE_UPDATE === 'true') {
        console.log('Updating admin credentials from environment variables...');
        
        existingAdmin.name = process.env.ADMIN_NAME;
        existingAdmin.email = process.env.ADMIN_EMAIL;
        
        // Only update password if it's explicitly being changed
        if (process.env.UPDATE_PASSWORD === 'true') {
          existingAdmin.password = process.env.ADMIN_PASSWORD;
        }
        
        await existingAdmin.save();
        console.log('Admin credentials updated successfully!');
      }
    } else {
      // Create admin with credentials from environment variables
      const admin = new Admin({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      
      await admin.save();
      
      console.log('Admin account created successfully:');
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin account:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeAdmin();