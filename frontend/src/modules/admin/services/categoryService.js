// Category management service
const CATEGORIES_KEY = 'admin_categories';

// Initialize with dummy data if not exists
function initializeCategories() {
  const existing = localStorage.getItem(CATEGORIES_KEY);
  if (!existing) {
    const defaultCategories = [
      {
        id: 1,
        name: 'ब्रेकिंग न्यूज़',
        description: 'ताज़ा और महत्वपूर्ण समाचार',
        icon: '🔥',
        color: '#F4C20D',
        order: 1,
        status: 'active',
        newsCount: 320,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'राजनीति',
        description: 'राजनीतिक समाचार और अपडेट्स',
        icon: '🏛️',
        color: '#E21E26',
        order: 2,
        status: 'active',
        newsCount: 280,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'खेलकूद',
        description: 'खेल समाचार और अपडेट्स',
        icon: '⚽',
        color: '#10B981',
        order: 3,
        status: 'active',
        newsCount: 250,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
  }
}

// Initialize on load
initializeCategories();

export const categoryService = {
  // Get all categories
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    return categories.sort((a, b) => a.order - b.order);
  },

  // Get category by ID
  getById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    return categories.find(cat => cat.id === parseInt(id));
  },

  // Create new category
  create: async (categoryData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');

    const newCategory = {
      id: Date.now(),
      ...categoryData,
      newsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    categories.push(newCategory);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
  },

  // Update category
  update: async (id, categoryData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    const index = categories.findIndex(cat => cat.id === parseInt(id));
    
    if (index === -1) {
      throw new Error('श्रेणी नहीं मिली');
    }

    categories[index] = {
      ...categories[index],
      ...categoryData,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories[index];
  },

  // Delete category
  delete: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    const category = categories.find(cat => cat.id === parseInt(id));
    
    if (!category) {
      throw new Error('श्रेणी नहीं मिली');
    }

    // Check if category has news
    if (category.newsCount > 0) {
      throw new Error('इस श्रेणी में समाचार हैं। पहले समाचार हटाएं या दूसरी श्रेणी में स्थानांतरित करें।');
    }

    const filtered = categories.filter(cat => cat.id !== parseInt(id));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filtered));
    return true;
  },

  // Reorder categories
  reorder: async (categoryIds) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]');
    
    categoryIds.forEach((id, index) => {
      const category = categories.find(cat => cat.id === id);
      if (category) {
        category.order = index + 1;
        category.updatedAt = new Date().toISOString();
      }
    });

    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return categories;
  }
};

