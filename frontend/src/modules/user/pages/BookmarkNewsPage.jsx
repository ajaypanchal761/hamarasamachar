import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarkedNews } from '../utils/bookmarkUtils';
import { getAllNews } from '../data/dummyNewsData';
import NewsCard from '../components/NewsCard';
import BottomNavbar from '../components/BottomNavbar';

function BookmarkNewsPage() {
  const navigate = useNavigate();
  const [bookmarkedNews, setBookmarkedNews] = useState([]);

  useEffect(() => {
    // Initialize with some dummy bookmarked data if no bookmarks exist
    const bookmarkedIds = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    if (bookmarkedIds.length === 0) {
      // Add some dummy bookmarks for testing (first 5 news items)
      const initialBookmarks = [1, 2, 3, 4, 5];
      localStorage.setItem('bookmarkedNews', JSON.stringify(initialBookmarks));
    }
    
    // Get all news and filter bookmarked ones
    const allNews = getAllNews();
    const bookmarked = getBookmarkedNews(allNews);
    setBookmarkedNews(bookmarked);
  }, []);

  // Listen for storage changes and custom events to update bookmarks
  useEffect(() => {
    const handleBookmarkChange = () => {
      const allNews = getAllNews();
      const bookmarked = getBookmarkedNews(allNews);
      setBookmarkedNews(bookmarked);
    };

    // Listen for custom event (same tab)
    window.addEventListener('bookmarksChanged', handleBookmarkChange);
    // Listen for storage event (other tabs)
    window.addEventListener('storage', handleBookmarkChange);
    // Also check on focus in case bookmarks changed in another tab
    window.addEventListener('focus', handleBookmarkChange);

    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarkChange);
      window.removeEventListener('storage', handleBookmarkChange);
      window.removeEventListener('focus', handleBookmarkChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-bold text-gray-800">बुकमार्क न्यूज़</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-3 pb-20 sm:pb-24">
        {bookmarkedNews.length > 0 ? (
          <div className="space-y-0">
            {bookmarkedNews.map((news) => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p className="text-gray-500 text-base mb-1">कोई बुकमार्क नहीं मिला</p>
            <p className="text-gray-400 text-xs">समाचार सेव करने के लिए "सेव करें" बटन का उपयोग करें</p>
          </div>
        )}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default BookmarkNewsPage;

