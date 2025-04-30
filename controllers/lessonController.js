const { Subcategory, Lesson } = require('../models/CourseModels');

// Helper function to convert video URLs
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

const lessonController = {
  // Get all lessons for a specific subcategory
  getLessonsBySubcategory: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      
      if (isNaN(subcategoryId)) {
        return res.status(400).json({ success: false, message: 'Invalid subcategory ID format' });
      }
      
      console.log(`Looking for lessons in subcategory ID: ${subcategoryId}`);
      
      // First check if the subcategory exists
      const subcategory = await Subcategory.findOne({ id: subcategoryId });
      
      if (!subcategory) {
        console.log(`Subcategory with ID ${subcategoryId} not found`);
        return res.status(404).json({ success: false, message: 'Subcategory not found' });
      }
      
      // Now find all lessons for this subcategory
      const lessons = await Lesson.find({ subcategoryId }).sort({ day: 1, order: 1 });
      
      console.log(`Found ${lessons.length} lessons in subcategory ${subcategoryId}`);
      res.status(200).json({ success: true, data: lessons });
    } catch (error) {
      console.error(`Error fetching lessons for subcategory ${req.params.subcategoryId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching lessons' });
    }
  },

  // Get a specific lesson by ID within a subcategory
  getLessonById: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(subcategoryId) || isNaN(lessonId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      
      console.log(`Looking for lesson ${lessonId} in subcategory ${subcategoryId}`);
      
      // Check if the subcategory exists
      const subcategory = await Subcategory.findOne({ id: subcategoryId });
      
      if (!subcategory) {
        console.log(`Subcategory with ID ${subcategoryId} not found`);
        return res.status(404).json({ success: false, message: 'Subcategory not found' });
      }
      
      // Find the specific lesson
      const lesson = await Lesson.findOne({ 
        id: lessonId,
        subcategoryId: subcategoryId
      });
      
      if (!lesson) {
        console.log(`Lesson with ID ${lessonId} not found in subcategory ${subcategoryId}`);
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }
      
      console.log(`Found lesson: ${lesson.title}`);
      
      // Ensure videoUrl is in embed format - belt and suspenders approach
      if (lesson.videoUrl) {
        lesson.videoUrl = convertToEmbedUrl(lesson.videoUrl);
      }
      
      res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      console.error(`Error fetching lesson ${req.params.lessonId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while fetching lesson' });
    }
  },

  // Create a new lesson in a subcategory
  createLesson: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const { day, title, description, videoUrl, topics, duration } = req.body;
      
      // Validate input parameters
      if (isNaN(subcategoryId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid subcategory ID format' 
        });
      }
      
      // Comprehensive input validation
      if (!day) {
        return res.status(400).json({ 
          success: false, 
          message: 'Day is required' 
        });
      }

      if (!title || title.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Title is required' 
        });
      }

      if (!description || description.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Description is required' 
        });
      }
      
      // Check if the subcategory exists
      const subcategory = await Subcategory.findOne({ id: subcategoryId });
      
      if (!subcategory) {
        console.log(`Subcategory with ID ${subcategoryId} not found`);
        return res.status(404).json({ 
          success: false, 
          message: 'Subcategory not found' 
        });
      }
      
      // Generate new lesson ID
      let newLessonId;
      
      // Find the highest lesson ID across all lessons and increment by 1
      const highestLesson = await Lesson.findOne().sort('-id');
      if (highestLesson) {
        newLessonId = highestLesson.id + 1;
      } else {
        // First lesson in the database
        newLessonId = 1;
      }
      
      // Sanitize and prepare input data
      const sanitizedTopics = Array.isArray(topics) 
        ? topics.filter(topic => topic && topic.trim() !== '')
        : [];
      
      // Convert video URL to embed format if needed
      const processedVideoUrl = videoUrl ? convertToEmbedUrl(videoUrl.trim()) : '';
      
      // Create the new lesson with the Lesson model
      const newLesson = new Lesson({
        id: newLessonId,
        subcategoryId: subcategoryId,
        day: parseInt(day),
        title: title.trim(),
        description: description.trim(),
        videoUrl: processedVideoUrl,
        topics: sanitizedTopics,
        duration: duration ? duration.trim() : '45 minutes',
        order: 0 // Default order
      });
      
      // Save the new lesson
      await newLesson.save();
      
      console.log(`Created new lesson "${title}" with ID ${newLessonId} in subcategory ${subcategoryId}`);
      console.log(`Video URL saved as: ${processedVideoUrl}`);
      
      res.status(201).json({ 
        success: true, 
        message: 'Lesson created successfully',
        data: newLesson
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      
      // More detailed error handling
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          success: false, 
          message: Object.values(error.errors).map(err => err.message).join(', ')
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Server error while creating lesson',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Update a lesson
  updateLesson: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const lessonId = parseInt(req.params.lessonId);
      const { day, title, description, videoUrl, topics, duration, order } = req.body;
      
      if (isNaN(subcategoryId) || isNaN(lessonId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      
      // Validate required fields
      if (!day) {
        return res.status(400).json({ 
          success: false, 
          message: 'Day is required' 
        });
      }

      if (!title || title.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Title is required' 
        });
      }

      if (!description || description.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          message: 'Description is required' 
        });
      }
      
      // Find the lesson
      const lesson = await Lesson.findOne({ 
        id: lessonId,
        subcategoryId: subcategoryId
      });
      
      if (!lesson) {
        console.log(`Lesson with ID ${lessonId} not found in subcategory ${subcategoryId}`);
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }
      
      // Convert video URL to embed format if needed
      const processedVideoUrl = videoUrl ? convertToEmbedUrl(videoUrl.trim()) : '';
      
      // Sanitize and update the lesson fields
      lesson.day = parseInt(day);
      lesson.title = title.trim();
      lesson.description = description.trim();
      lesson.videoUrl = processedVideoUrl;
      lesson.topics = Array.isArray(topics) 
        ? topics.filter(topic => topic && topic.trim() !== '')
        : [];
      lesson.duration = duration ? duration.trim() : '45 minutes';
      lesson.order = order !== undefined ? parseInt(order) : 0;
      
      // Save the updated lesson
      await lesson.save();
      
      console.log(`Updated lesson ${lessonId}: ${lesson.title}`);
      console.log(`Video URL updated to: ${processedVideoUrl}`);
      
      res.status(200).json({ 
        success: true, 
        message: 'Lesson updated successfully',
        data: lesson
      });
    } catch (error) {
      console.error(`Error updating lesson ${req.params.lessonId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while updating lesson' });
    }
  },

  // Delete a lesson
  deleteLesson: async (req, res) => {
    try {
      const subcategoryId = parseInt(req.params.subcategoryId);
      const lessonId = parseInt(req.params.lessonId);
      
      if (isNaN(subcategoryId) || isNaN(lessonId)) {
        return res.status(400).json({ success: false, message: 'Invalid ID format' });
      }
      
      // Find and delete the lesson
      const deletedLesson = await Lesson.findOneAndDelete({ 
        id: lessonId,
        subcategoryId: subcategoryId
      });
      
      if (!deletedLesson) {
        console.log(`Lesson with ID ${lessonId} not found in subcategory ${subcategoryId}`);
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }
      
      console.log(`Deleted lesson ${lessonId}: ${deletedLesson.title} from subcategory ${subcategoryId}`);
      res.status(200).json({ 
        success: true, 
        message: 'Lesson deleted successfully',
        data: { id: lessonId }
      });
    } catch (error) {
      console.error(`Error deleting lesson ${req.params.lessonId}:`, error);
      res.status(500).json({ success: false, message: 'Server error while deleting lesson' });
    }
  }
};

module.exports = lessonController;