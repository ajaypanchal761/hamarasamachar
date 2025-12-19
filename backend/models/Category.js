import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  newsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hindi to English slug mapping (matching frontend constants)
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
  
  // Check if we have a direct mapping
  if (HINDI_TO_SLUG_MAP[trimmedName]) {
    return HINDI_TO_SLUG_MAP[trimmedName];
  }

  // Try to generate slug from name
  let slug = trimmedName
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters but keep word chars, spaces, hyphens
    .replace(/\s+/g, '-')       // Replace spaces with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single
    .trim();

  // If slug is empty after processing, use fallback
  if (!slug || slug.length === 0) {
    // Use first few characters of name (if available) or timestamp
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

// Auto-generate slug from name
categorySchema.pre('save', async function(next) {
  try {
    // Generate slug if:
    // 1. Name is modified AND slug is empty/not set, OR
    // 2. Slug is explicitly empty string (from update)
    const shouldGenerateSlug = (this.isModified('name') && (!this.slug || this.slug.trim() === '')) || 
                               (this.slug === '' || (this.slug && this.slug.trim() === ''));
    
    if (shouldGenerateSlug && this.name && this.name.trim()) {
      let baseSlug = generateSlug(this.name);
      
      // Check for duplicates and append number if needed
      let slug = baseSlug;
      let counter = 1;
      const Category = this.constructor;
      
      // Check if slug already exists (excluding current document if updating)
      const query = { slug };
      if (!this.isNew) {
        query._id = { $ne: this._id };
      }
      
      let existingCategory = await Category.findOne(query);
      
      while (existingCategory) {
        slug = `${baseSlug}-${counter}`;
        query.slug = slug;
        existingCategory = await Category.findOne(query);
        counter++;
        
        // Safety limit to prevent infinite loop
        if (counter > 1000) {
          slug = `${baseSlug}-${Date.now()}`;
          break;
        }
      }
      
      this.slug = slug;
    } else if (!this.slug || this.slug.trim() === '') {
      // Fallback: if somehow slug is still empty, generate one
      this.slug = `category-${Date.now()}`;
    }
    next();
  } catch (error) {
    // If slug generation fails, use timestamp-based fallback
    if (!this.slug || this.slug.trim() === '') {
      this.slug = `category-${Date.now()}`;
    }
    next();
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;

