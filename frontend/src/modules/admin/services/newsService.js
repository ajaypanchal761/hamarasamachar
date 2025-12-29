const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

// Helper function to transform backend news to frontend format
const transformNews = (backendNews) => {
  return {
    id: backendNews.sequentialId || backendNews._id,
    _id: backendNews._id,
    title: backendNews.title,
    category: backendNews.category?.name || backendNews.category || '',
    categoryId: backendNews.category?._id || backendNews.category || '',
    author: backendNews.author || '',
    date: backendNews.publishDate ? new Date(backendNews.publishDate).toISOString().split('T')[0] : '',
    status: backendNews.status || 'draft',
    views: backendNews.views || 0,
    featuredImage: backendNews.featuredImage || '',
    videoUrl: backendNews.videoUrl || '',
    district: backendNews.district || '',
    isBreakingNews: backendNews.isBreakingNews || false,
    content: backendNews.content || '',
    metaDescription: backendNews.metaDescription || '',
    tags: Array.isArray(backendNews.tags) ? backendNews.tags.join(', ') : (backendNews.tags || ''),
    publishDate: backendNews.publishDate || new Date().toISOString(),
    createdAt: backendNews.createdAt,
    updatedAt: backendNews.updatedAt
  };
};

// Get all news with filters
export const getAllNews = async (filters = {}) => {
  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.author) params.append('author', filters.author);
    if (filters.dateRange) params.append('dateRange', filters.dateRange);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await fetch(`${API_BASE_URL}/admin/news?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch news');
    }
    
    const data = await response.json();
    
    // Transform data
    return {
      success: true,
      data: data.data.map(transformNews),
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 25
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Get news by ID
export const getNewsById = async (id) => {
  try {
    const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch news');
    }
    
    const data = await response.json();
    return {
      success: true,
      data: transformNews(data.data)
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};

// Create news
export const createNews = async (newsData) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();

    // Append all fields except files
    Object.keys(newsData).forEach(key => {
      if (key !== 'thumbnailFile' && key !== 'mediaFile' && key !== 'featuredImageFile' && key !== 'videoFile') {
        if (newsData[key] !== null && newsData[key] !== undefined) {
          formData.append(key, newsData[key]);
        }
      }
    });

    // Append thumbnail file if provided (mandatory)
    if (newsData.thumbnailFile) {
      formData.append('thumbnailFile', newsData.thumbnailFile);
    }

    // Append media file if provided (optional)
    if (newsData.mediaFile) {
      formData.append('mediaFile', newsData.mediaFile);
    }
    
      const response = await fetch(`${API_BASE_URL}/admin/news`, {
      method: 'POST',
      headers: {
        // No authorization header needed - endpoint is now public
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create news');
    }
    
    const data = await response.json();
    return {
      success: true,
      data: transformNews(data.data)
    };
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
};

// Update news
export const updateNews = async (id, newsData) => {
  try {
    const token = getAuthToken();
    const formData = new FormData();

    // Append all fields except files
    Object.keys(newsData).forEach(key => {
      if (key !== 'thumbnailFile' && key !== 'mediaFile' && key !== 'featuredImageFile' && key !== 'videoFile') {
        if (newsData[key] !== null && newsData[key] !== undefined) {
          formData.append(key, newsData[key]);
        }
      }
    });

    // Append thumbnail file if provided (mandatory)
    if (newsData.thumbnailFile) {
      formData.append('thumbnailFile', newsData.thumbnailFile);
    }

    // Append media file if provided (optional)
    if (newsData.mediaFile) {
      formData.append('mediaFile', newsData.mediaFile);
    }
    
      const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update news');
    }
    
    const data = await response.json();
    return {
      success: true,
      data: transformNews(data.data)
    };
  } catch (error) {
    console.error('Error updating news:', error);
    throw error;
  }
};

// Delete news
export const deleteNews = async (id) => {
  try {
    const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/news/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete news');
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'News deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting news:', error);
    throw error;
  }
};

// Bulk delete news
export const bulkDeleteNews = async (ids) => {
  try {
    const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/news/bulk-delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ids })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete news');
    }
    
    const data = await response.json();
    return {
      success: true,
      message: data.message || 'News deleted successfully'
    };
  } catch (error) {
    console.error('Error bulk deleting news:', error);
    throw error;
  }
};

// Update news status
export const updateNewsStatus = async (id, status) => {
  try {
    return await updateNews(id, { status });
  } catch (error) {
    console.error('Error updating news status:', error);
    throw error;
  }
};

// Duplicate news
export const duplicateNews = async (id) => {
  try {
    const news = await getNewsById(id);
    if (!news.success) {
      throw new Error('Failed to fetch news for duplication');
    }
    
    const newsData = news.data;
    // Remove fields that shouldn't be duplicated
    const { _id, id: sequentialId, createdAt, updatedAt, views, ...duplicateData } = newsData;
    
    // Modify title to indicate it's a copy
    duplicateData.title = `${duplicateData.title} (Copy)`;
    duplicateData.status = 'draft';
    
    return await createNews(duplicateData);
  } catch (error) {
    console.error('Error duplicating news:', error);
    throw error;
  }
};

export default {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  bulkDeleteNews,
  updateNewsStatus,
  duplicateNews
};

