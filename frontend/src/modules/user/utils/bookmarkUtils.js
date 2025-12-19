// Utility functions for managing bookmarked/saved news

// Get all bookmarked news IDs
export const getBookmarkedNewsIds = () => {
  const bookmarks = localStorage.getItem('bookmarkedNews');
  return bookmarks ? JSON.parse(bookmarks) : [];
};

// Check if a news item is bookmarked
export const isNewsBookmarked = (newsId) => {
  const bookmarkedIds = getBookmarkedNewsIds();
  // Handle both string and number IDs
  return bookmarkedIds.some(id => String(id) === String(newsId));
};

// Add news to bookmarks
export const addToBookmarks = (newsId) => {
  const bookmarkedIds = getBookmarkedNewsIds();
  if (!bookmarkedIds.includes(newsId)) {
    bookmarkedIds.push(newsId);
    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarkedIds));
  }
};

// Remove news from bookmarks
export const removeFromBookmarks = (newsId) => {
  const bookmarkedIds = getBookmarkedNewsIds();
  const updatedIds = bookmarkedIds.filter(id => id !== newsId);
  localStorage.setItem('bookmarkedNews', JSON.stringify(updatedIds));
};

// Toggle bookmark status - syncs with API if authenticated, otherwise uses localStorage
export const toggleBookmark = async (newsId) => {
  const token = localStorage.getItem('userToken');
  
  // If authenticated, use API
  if (token) {
    try {
      const { toggleBookmark: toggleBookmarkAPI } = await import('../services/bookmarkService');
      const isBookmarked = await toggleBookmarkAPI(newsId);
      
      // Also update localStorage for consistency
      if (isBookmarked) {
        addToBookmarks(newsId);
      } else {
        removeFromBookmarks(newsId);
      }
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('bookmarksChanged', { detail: { newsId, isBookmarked } }));
      return isBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark via API:', error);
      // Fallback to localStorage on error
    }
  }
  
  // Fallback to localStorage if not authenticated or API fails
  let isBookmarked = false;
  if (isNewsBookmarked(newsId)) {
    removeFromBookmarks(newsId);
    isBookmarked = false;
  } else {
    addToBookmarks(newsId);
    isBookmarked = true;
  }
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new CustomEvent('bookmarksChanged', { detail: { newsId, isBookmarked } }));
  return isBookmarked;
};

// Get all bookmarked news objects
export const getBookmarkedNews = (allNews) => {
  const bookmarkedIds = getBookmarkedNewsIds();
  return allNews.filter(news => {
    const newsId = news.id || news._id;
    return bookmarkedIds.some(id => String(id) === String(newsId));
  });
};

