const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all e-papers for user
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Response with e-papers data
 */
export const getUserEpapers = async (options = {}) => {
  try {
    const { page = 1, limit = 20 } = options;
    const params = new URLSearchParams({ page, limit });

    const response = await fetch(`${API_BASE_URL}/user/epaper?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch e-papers');
    }

    // Transform API response to match frontend format
    const transformedData = (data.data || []).map(epaper => ({
      id: epaper._id || epaper.id,
      date: epaper.date,
      pdfUrl: epaper.pdfUrl,
      coverUrl: epaper.coverUrl || 'https://via.placeholder.com/150x200?text=E-paper',
      fileName: epaper.fileName,
      views: epaper.views || 0
    }));

    return {
      data: transformedData,
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit
    };
  } catch (error) {
    console.error('Get user epapers error:', error);
    throw error;
  }
};

/**
 * Get e-paper by ID
 * @param {String} id - E-paper ID
 * @returns {Promise<Object>} E-paper data
 */
export const getEpaperById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/epaper/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch e-paper');
    }

    const epaper = data.data;
    return {
      id: epaper._id || epaper.id,
      date: epaper.date,
      pdfUrl: epaper.pdfUrl,
      coverUrl: epaper.coverUrl || 'https://via.placeholder.com/150x200?text=E-paper',
      fileName: epaper.fileName,
      views: epaper.views || 0
    };
  } catch (error) {
    console.error('Get epaper by ID error:', error);
    throw error;
  }
};

