// News service for user panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Format time ago (e.g., "10m ago", "2h ago")
 */
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'अभी';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  } catch (error) {
    return '';
  }
};

/**
 * Transform API news data to match frontend expected format
 */
const transformNewsData = (newsArray) => {
  return newsArray.map(news => ({
    id: news._id || news.id,
    title: news.title || '',
    category: news.category?.name || news.categoryName || 'अन्य',
    type: news.type || (news.videoUrl ? 'video' : 'photo'),
    image: news.featuredImage || news.image || '',
    videoUrl: news.videoUrl || null,
    duration: news.duration || null,
    subtitle: news.subtitle || '',
    subtitleText: news.subtitleText || news.metaDescription || news.description || news.excerpt || '',
    description: news.metaDescription || news.description || news.excerpt || '',
    content: news.content || '',
    author: news.author?.name || news.author || 'रिपोर्टर',
    date: news.publishDate ? new Date(news.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    timeAgo: formatTimeAgo(news.publishDate),
    isBreaking: news.isBreakingNews || false,
    district: news.district || null,
    tags: news.tags || [],
    contentSections: news.contentSections || [],
    views: news.views || 0
  }));
};

/**
 * Get news by category (replaces getNewsByCategory mock function)
 * This function maintains the same logic as the mock data version:
 * - "ब्रेकिंग" uses isBreakingNews flag (not a category)
 * - Regular categories filter by category slug
 * - राजस्थान can filter by district
 * 
 * @param {string} categoryName - Category name in Hindi (e.g., 'ब्रेकिंग', 'राजस्थान')
 * @param {string} categorySlug - Category slug from API (e.g., 'breaking', 'rajasthan')
 * @param {string} district - District name (optional, only for राजस्थान)
 * @param {Object} options - Pagination options
 * @returns {Promise<Array>} Array of news items
 */
export const getNewsByCategory = async (categoryName, categorySlug, district = null, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const params = new URLSearchParams();
    
    // Special handling for "ब्रेकिंग" or "ब्रेकिंग न्यूज़" - use isBreakingNews flag (same logic as mock data)
    // Handle both "ब्रेकिंग" and "ब्रेकिंग न्यूज़" as breaking news
    if (categoryName === 'ब्रेकिंग' || categoryName === 'ब्रेकिंग न्यूज़' || categorySlug === 'breaking' || categorySlug === 'breaking-news') {
      params.append('isBreakingNews', 'true');
    } else if (categorySlug) {
      // Use slug for API call (regular category filtering)
      params.append('category', categorySlug);
    } else if (categoryName && categoryName !== 'ब्रेकिंग' && categoryName !== 'ब्रेकिंग न्यूज़') {
      // If no slug provided but category name exists, try to use name directly
      // This handles cases where slug might not be available yet
      params.append('category', categoryName);
    }
    
    // District filter (only for राजस्थान, same logic as mock data)
    if (categoryName === 'राजस्थान' && district && district !== 'सभी जिले') {
      params.append('district', district);
    }
    
    params.append('page', page);
    params.append('limit', limit);

    const token = localStorage.getItem('userToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/news?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Transform API response to match expected format
    return transformNewsData(data.data || []);
  } catch (error) {
    console.error('Get news by category error:', error);
    throw error;
  }
};

/**
 * Get all news
 * @param {Object} filters - Filter options (category, district, page, limit)
 * @returns {Promise<Object>} Response object with news data
 */
export const getAllNews = async (filters = {}) => {
  try {
    const { category, district, page = 1, limit = 20, isBreakingNews } = filters;
    
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (district && district !== 'सभी जिले' && district !== 'all') {
      params.append('district', district);
    }
    params.append('page', page);
    params.append('limit', limit);
    if (isBreakingNews) params.append('isBreakingNews', 'true');

    const token = localStorage.getItem('userToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/news?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    return {
      ...data,
      data: transformNewsData(data.data || [])
    };
  } catch (error) {
    console.error('Get all news error:', error);
    throw error;
  }
};

/**
 * Get news by ID
 * @param {string} id - News ID
 * @returns {Promise<Object>} News object
 */
export const getNewsById = async (id) => {
  try {
    const token = localStorage.getItem('userToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/user/news/${id}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Transform single news item
    const transformed = transformNewsData([data.data])[0];
    return transformed;
  } catch (error) {
    console.error('Get news by ID error:', error);
    throw error;
  }
};

/**
 * Get breaking news
 * @returns {Promise<Array>} Array of breaking news
 */
export const getBreakingNews = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/news/breaking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch breaking news');
    }

    return transformNewsData(data.data || []);
  } catch (error) {
    console.error('Get breaking news error:', error);
    throw error;
  }
};

/**
 * Get banners by position
 * @param {string} position - Banner position (e.g., 'news_feed', 'header')
 * @param {string} category - Optional category filter
 * @returns {Promise<Array>} Array of banners
 */
export const getBanners = async (position, category = null) => {
  try {
    let url = `${API_BASE_URL}/user/news/banners/${position}`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return []; // Return empty array if no banners
    }

    return data.data || [];
  } catch (error) {
    console.error('Get banners error:', error);
    return []; // Return empty array on error
  }
};


