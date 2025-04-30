// migration-script.js
require('dotenv').config(); // If you use environment variables
const mongoose = require('mongoose');
const { Lesson } = require('./models/CourseModels');

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

async function migrateVideoUrls() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find all lessons with videoUrl
    const lessons = await Lesson.find({
      videoUrl: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`Found ${lessons.length} lessons with video URLs`);
    
    let updateCount = 0;
    let noChangeCount = 0;
    
    // Process each lesson
    for (const lesson of lessons) {
      const originalUrl = lesson.videoUrl;
      const newUrl = convertToEmbedUrl(originalUrl);
      
      // Only update if URL changed
      if (newUrl !== originalUrl) {
        console.log(`Lesson ID ${lesson.id}: ${originalUrl} -> ${newUrl}`);
        
        lesson.videoUrl = newUrl;
        await lesson.save();
        updateCount++;
      } else {
        noChangeCount++;
      }
    }
    
    console.log('Migration completed successfully:');
    console.log(`- Updated: ${updateCount} lessons`);
    console.log(`- No change needed: ${noChangeCount} lessons`);
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateVideoUrls();