import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks } from '../services/bookmarkService';
import NewsCard from '../components/NewsCard';
import BottomNavbar from '../components/BottomNavbar';

function BookmarkNewsPage() {
  const navigate = useNavigate();
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    setIsAuthenticated(!!token);
  }, []);

  // Fetch bookmarked news from API
  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('कृपया लॉगिन करें');
          setLoading(false);
          return;
        }

        const response = await getBookmarks({ limit: 100 });
        setBookmarkedNews(response.data || []);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError(err.message || 'बुकमार्क लोड करने में त्रुटि हुई');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Listen for bookmark changes to refresh the list
  useEffect(() => {
    const handleBookmarkChange = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return;

      try {
        const response = await getBookmarks({ limit: 100 });
        setBookmarkedNews(response.data || []);
      } catch (err) {
        console.error('Error refreshing bookmarks:', err);
      }
    };

    // Listen for custom event (same tab)
    window.addEventListener('bookmarksChanged', handleBookmarkChange);
    // Listen for storage event (other tabs)
    window.addEventListener('storage', handleBookmarkChange);

    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarkChange);
      window.removeEventListener('storage', handleBookmarkChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="page-transition pb-20 sm:pb-24">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200" style={{ backgroundColor: '#E21E26' }}>
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:opacity-80 transition-opacity p-1 flex items-center justify-center"
            aria-label="Back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-sm sm:text-base font-bold text-white">बुकमार्क न्यूज़</h2>
          <div className="w-6 sm:w-8"></div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-3 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-500 text-base">बुकमार्क लोड हो रहे हैं...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
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
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-500 text-base mb-4">{error}</p>
              {error.includes('लॉगिन') && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
                >
                  लॉगिन करें
                </button>
              )}
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center py-12">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-gray-500 text-base mb-4">बुकमार्क देखने के लिए कृपया लॉगिन करें</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors"
              >
                लॉगिन करें
              </button>
            </div>
          ) : bookmarkedNews.length > 0 ? (
            <div className="space-y-0">
              {bookmarkedNews.map((news) => {
                const newsId = news.id || news._id;
                return <NewsCard key={newsId} news={news} />;
              })}
            </div>
          ) : (
            <div className="text-center py-12">
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
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default BookmarkNewsPage;
