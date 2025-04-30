// models/CourseModels.js 
const mongoose = require('mongoose');

// Function to convert YouTube URLs to embed format
function convertToEmbedUrl(url) {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // Already an embed URL
    if (url.includes('/embed/')) return url;
    
    // Convert YouTube watch URLs to embed format
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert YouTube short links
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert YouTube thumbnails to embeds
    if (url.includes('img.youtube.com/vi/')) {
      const parts = url.split('/');
      const videoIdIndex = parts.indexOf('vi') + 1;
      if (videoIdIndex < parts.length) {
        const videoId = parts[videoIdIndex].split('/')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Return original URL if no conversions matched
    return url;
  } catch (error) {
    console.error('Error converting video URL:', error);
    return url;
  }
}

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
    type: String,
    set: function(url) {
      return convertToEmbedUrl(url);
    }
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
  },
  // IMPORTANT: Add a reference to the parent subcategory
  subcategoryId: {
    type: Number,
    required: true
  }
});

// Subcategory Schema - FIXED
const SubcategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  // CRITICAL FIX: Change to Number to match how you're querying
  courseId: {
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
  thumbnail: {
    type: String
  },
  // Remove embedded lessons array and replace with virtual
  order: {
    type: Number,
    default: 0
  }
});

// Virtual for getting lessons (instead of embedding them)
SubcategorySchema.virtual('lessons', {
  ref: 'Lesson',
  localField: 'id',
  foreignField: 'subcategoryId',
  justOne: false
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
  // Remove direct subcategories array and use virtual instead
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for getting subcategories
CourseSchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: 'id',
  foreignField: 'courseId',
  justOne: false
});

// Enable virtuals in JSON
CourseSchema.set('toJSON', { virtuals: true });
SubcategorySchema.set('toJSON', { virtuals: true });
LessonSchema.set('toJSON', { virtuals: true });

// Create indices for faster queries
CourseSchema.index({ id: 1 });
SubcategorySchema.index({ courseId: 1 });
SubcategorySchema.index({ id: 1 });
LessonSchema.index({ subcategoryId: 1 });

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