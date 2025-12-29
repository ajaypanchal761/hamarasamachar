import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkNews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hamara-samachar');
    console.log('Connected to MongoDB');

    const News = (await import('./models/News.js')).default;

    // Check total news count
    const totalNews = await News.countDocuments();
    console.log('Total news items:', totalNews);

    // Check news without featuredImage
    const newsWithoutImage = await News.find({
      $or: [
        { featuredImage: { $exists: false } },
        { featuredImage: null },
        { featuredImage: '' }
      ]
    });

    console.log('News without featuredImage:', newsWithoutImage.length);

    if (newsWithoutImage.length > 0) {
      console.log('Sample news without featuredImage:');
      newsWithoutImage.slice(0, 3).forEach(news => {
        console.log(`- ID: ${news._id}, Title: ${news.title}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkNews();
