// Utility functions for managing bookmarked/saved news

// Get all bookmarked news IDs
export const getBookmarkedNewsIds = () => {
  const bookmarks = localStorage.getItem('bookmarkedNews');
  return bookmarks ? JSON.parse(bookmarks) : [];
};

// Check if a news item is bookmarked
export const isNewsBookmarked = (newsId) => {
  const bookmarkedIds = getBookmarkedNewsIds();
  return bookmarkedIds.includes(newsId);
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

// Toggle bookmark status
export const toggleBookmark = (newsId) => {
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
  return allNews.filter(news => bookmarkedIds.includes(news.id));
};

