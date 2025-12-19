import mongoose from 'mongoose';
import dotenv from 'dotenv';
import News from '../models/News.js';

dotenv.config();

const fixDuplicateSlugs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all news with duplicate or invalid slugs
    const newsWithInvalidSlugs = await News.find({
      $or: [
        { slug: '-' },
        { slug: '' },
        { slug: { $exists: false } }
      ]
    });

    console.log(`Found ${newsWithInvalidSlugs.length} news items with invalid slugs`);

    // Fix each news item
    for (const news of newsWithInvalidSlugs) {
      let newSlug;
      
      if (news.title && news.title.trim() !== '') {
        // Generate slug from title
        newSlug = news.title.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim();
        
        // If slug is still invalid, use sequentialId
        if (!newSlug || newSlug === '-' || newSlug === '') {
          newSlug = `news-${news.sequentialId || news._id}`;
        }
      } else {
        // Use sequentialId or _id as fallback
        newSlug = `news-${news.sequentialId || news._id}`;
      }

      // Ensure uniqueness
      let finalSlug = newSlug;
      let counter = 1;
      while (await News.findOne({ slug: finalSlug, _id: { $ne: news._id } })) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }

      // Update the news item
      await News.findByIdAndUpdate(news._id, { slug: finalSlug });
      console.log(`Fixed slug for news ${news._id}: "${news.slug}" -> "${finalSlug}"`);
    }

    console.log('All duplicate slugs fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing duplicate slugs:', error);
    process.exit(1);
  }
};

fixDuplicateSlugs();

