import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Category from '../models/Category.js';

dotenv.config();

// Hindi to English slug mapping
const HINDI_TO_SLUG_MAP = {
  'ब्रेकिंग': 'breaking',
  'ब्रेकिंग न्यूज़': 'breaking-news',
  'इंटरव्यू': 'interview',
  'बाइट': 'byte',
  'क्राइम': 'crime',
  'समाचार बुलेटिन': 'news-bulletin',
  'स्पेशल बुलेटिन': 'special-bulletin',
  'प्रशासनिक': 'administrative',
  'नेशनल': 'national',
  'राजस्थान': 'rajasthan',
  'संपादकीय': 'editorial',
  'चुनाव': 'election',
  'राजनीति': 'politics',
  'सांस्कृतिक': 'cultural',
  'धार्मिक': 'religious',
  'सामाजिक': 'social',
  'खेलकूद': 'sports',
  'शिक्षा': 'education',
  'संगठन': 'organization',
  'मनोरंजन': 'entertainment',
  'फ़िल्मी दुनिया': 'film-world',
  'लाइफस्टाइल': 'lifestyle',
  'बिज़नेस': 'business',
  'टेक्नोलॉजी': 'technology'
};

// Generate slug from name
function generateSlug(name) {
  if (!name || typeof name !== 'string') {
    return `category-${Date.now()}`;
  }

  const trimmedName = name.trim();

  if (HINDI_TO_SLUG_MAP[trimmedName]) {
    return HINDI_TO_SLUG_MAP[trimmedName];
  }

  let slug = trimmedName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (!slug || slug.length === 0) {
    const fallback = trimmedName
      .substring(0, 10)
      .toLowerCase()
      .replace(/[^\w]/g, '');

    slug = fallback && fallback.length > 0
      ? `${fallback}-${Date.now().toString().slice(-6)}`
      : `category-${Date.now()}`;
  }

  return slug;
}

async function fixCategorySlugs() {
  try {
    await connectDB();

    const categories = await Category.find({
      $or: [
        { slug: { $exists: false } },
        { slug: '' },
        { slug: null }
      ]
    });

    if (categories.length === 0) {
      process.exit(0);
    }

    for (const category of categories) {
      let baseSlug = generateSlug(category.name);
      let slug = baseSlug;
      let counter = 1;

      let existingCategory = await Category.findOne({
        slug,
        _id: { $ne: category._id }
      });

      while (existingCategory) {
        slug = `${baseSlug}-${counter}`;
        existingCategory = await Category.findOne({
          slug,
          _id: { $ne: category._id }
        });
        counter++;

        if (counter > 1000) {
          slug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }

      category.slug = slug;
      await category.save();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing category slugs:', error);
    process.exit(1);
  }
}

// Run the script
fixCategorySlugs();
