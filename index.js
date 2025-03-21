// File: index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');



const cloudInDB = express();

// Middleware
cloudInDB.use(cors());
cloudInDB.use(express.json());

// Database Connection
mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("CloudIn Server connected with MongoDB"))
.catch((err) => {
  console.error("DB Connection failed!!!");
  console.error(err);
});

// Static files
cloudInDB.use(express.static('public'));

// Routes
cloudInDB.use('/api/admin', adminRoutes);
// Add this line near your other routes
cloudInDB.use('/api/users', userRoutes);
cloudInDB.use('/api/course', courseRoutes); // New course routes

// Serve admin login page
cloudInDB.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Basic root route
cloudInDB.get('/', (req, res) => {
  res.send(`<h1>CloudIn Server started and waiting for client request!!!!</h1>`);
});

// Error handling middleware
cloudInDB.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start server
cloudInDB.listen(PORT, () => {
  console.log(`CloudIn Server started at port ${PORT} and waiting for client request`);
});

module.exports = cloudInDB;