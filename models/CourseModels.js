// models/CourseModels.js
const mongoose = require('mongoose');

// Lesson Schema
const LessonSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String
  },
  topics: [{
    type: String,
    trim: true
  }],
  duration: {
    type: String,
    default: '45 minutes'
  },
  order: {
    type: Number,
    default: 0
  }
});

// Subcategory Schema
const SubcategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  courseId: {
    type: Number,
    required: true,
    ref: 'Course'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String
  },
  lessons: [LessonSchema],
  order: {
    type: Number,
    default: 0
  }
});

// Course Schema
const CourseSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  thumbnail: {
    type: String
  },
  instructor: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    default: '4 weeks'
  },
  lessons: {
    type: Number,
    default: 4
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models from schemas
const Course = mongoose.model('Course', CourseSchema);
const Subcategory = mongoose.model('Subcategory', SubcategorySchema);
const Lesson = mongoose.model('Lesson', LessonSchema);

// Export all models
module.exports = {
  Course,
  Subcategory,
  Lesson
};