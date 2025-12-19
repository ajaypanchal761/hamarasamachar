// Bookmark service for user panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Transform API news data to match frontend expected format
 */
const transformNewsData = (newsArray) => {
  // Filter out null/undefined news items (news that may have been deleted)
  const validNews = (newsArray || []).filter(news => news !== null && news !== undefined);
  
  return validNews.map(news => ({
    id: news._id || news.id,
    title: news.title,
    category: news.category?.name || news.categoryName || 'अन्य',
    type: news.type || (news.videoUrl ? 'video' : 'photo'),
    image: news.featuredImage || news.image,
    videoUrl: news.videoUrl || null,
    duration: news.duration || null,
    subtitle: news.subtitle || '',
    subtitleText: news.subtitleText || news.description || news.excerpt || '',
    description: news.description || news.excerpt || '',
    content: news.content || '',
    author: news.author?.name || news.author || 'रिपोर्टर',
    date: news.publishDate ? new Date(news.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    timeAgo: formatTimeAgo(news.publishDate),
    isBreaking: news.isBreakingNews || false,
    district: news.district || null,
    contentSections: news.contentSections || [],
    views: news.views || 0
  }));
};

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
 * Get all bookmarked news
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Response object with bookmarked news
 */
export const getBookmarks = async (options = {}) => {
  try {
    const { page = 1, limit = 100 } = options;
    
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);

    const response = await fetch(`${API_BASE_URL}/user/bookmarks?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch bookmarks');
    }

    return {
      ...data,
      data: transformNewsData(data.data || [])
    };
  } catch (error) {
    console.error('Get bookmarks error:', error);
    throw error;
  }
};

/**
 * Add bookmark
 * @param {string} newsId - News ID to bookmark
 * @returns {Promise<Object>} Response object
 */
export const addBookmark = async (newsId) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ newsId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add bookmark');
    }

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('bookmarksChanged', { 
      detail: { newsId, isBookmarked: true } 
    }));

    return data;
  } catch (error) {
    console.error('Add bookmark error:', error);
    throw error;
  }
};

/**
 * Remove bookmark
 * @param {string} newsId - News ID to remove from bookmarks
 * @returns {Promise<Object>} Response object
 */
export const removeBookmark = async (newsId) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/bookmarks/${newsId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove bookmark');
    }

    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('bookmarksChanged', { 
      detail: { newsId, isBookmarked: false } 
    }));

    return data;
  } catch (error) {
    console.error('Remove bookmark error:', error);
    throw error;
  }
};

/**
 * Check if news is bookmarked
 * @param {string} newsId - News ID to check
 * @returns {Promise<boolean>} True if bookmarked, false otherwise
 */
export const checkBookmark = async (newsId) => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return false; // Not authenticated, return false
    }

    const response = await fetch(`${API_BASE_URL}/user/bookmarks/check/${newsId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return false;
    }

    return data.isBookmarked || false;
  } catch (error) {
    console.error('Check bookmark error:', error);
    return false;
  }
};

/**
 * Toggle bookmark status
 * @param {string} newsId - News ID to toggle
 * @returns {Promise<boolean>} New bookmark status (true if bookmarked, false if removed)
 */
export const toggleBookmark = async (newsId) => {
  try {
    // First check if it's bookmarked
    const isBookmarked = await checkBookmark(newsId);
    
    if (isBookmarked) {
      await removeBookmark(newsId);
      return false;
    } else {
      await addBookmark(newsId);
      return true;
    }
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    throw error;
  }
};

