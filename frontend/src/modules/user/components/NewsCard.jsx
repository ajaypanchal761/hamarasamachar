import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleBookmark, isNewsBookmarked } from '../utils/bookmarkUtils';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import LazyImage from '../../../components/LazyImage';
import LazyVideo from '../../../components/LazyVideo';

function NewsCard({ news, isInBookmarkPage = false }) {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const isVideo = news.type === 'video';
  const videoRef = useRef(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Format duration in MM:SS format
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video ko fast speed se play karna aur sirf ek chhota portion loop karna
  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video) return;

    let handleTimeUpdate = null;

    // Video ready hone ke baad setup karo
    const setupVideo = () => {
      video.playbackRate = 2.0; // Fast speed (2x)

      // Agar video 30 seconds se chhota hai, to pura video loop karo
      // Agar 30 seconds ya usse bada hai, to sirf 30 seconds tak loop karo
      if (video.duration && video.duration < 30) {
        // Chhota video hai - pura video loop hoga (loop attribute already hai)
        // Koi timeupdate listener nahi lagana
      } else {
        // Bada video hai - sirf 30 seconds tak loop karo
        handleTimeUpdate = () => {
          if (video.currentTime >= 30) { // 30 seconds ke baad reset
            video.currentTime = 0;
          }
        };
        video.addEventListener('timeupdate', handleTimeUpdate);
      }
    };

    // Agar video already ready hai
    if (video.readyState >= 2 && video.duration) {
      setupVideo();
    } else {
      // Video load hone ka wait karo
      const handleLoadedMetadata = () => {
        setupVideo();
      };
      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      video.addEventListener('canplay', handleLoadedMetadata, { once: true });
    }

    return () => {
      if (handleTimeUpdate) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [isVideo, news.videoUrl]);
  const categoryColors = {
    'ब्रेकिंग': '#E21E26',
    'राजनीति': '#1E88E5',
    'क्राइम': '#D32F2F',
    'नेशनल': '#F57C00',
    'राजस्थान': '#E21E26',
    'लाइफस्टाइल': '#9C27B0', // Purple like screenshot
    'default': '#666666'
  };

  const headingColor = categoryColors[news.category] || categoryColors['default'];

  // Split title by colon (ः or :)
  const colonIndexEng = news.title.indexOf(':');
  const colonIndexHindi = news.title.indexOf('ः');
  let colonIndex = -1;
  let colonChar = '';

  if (colonIndexEng !== -1 && colonIndexHindi !== -1) {
    colonIndex = Math.min(colonIndexEng, colonIndexHindi);
    colonChar = colonIndex === colonIndexEng ? ':' : 'ः';
  } else if (colonIndexEng !== -1) {
    colonIndex = colonIndexEng;
    colonChar = ':';
  } else if (colonIndexHindi !== -1) {
    colonIndex = colonIndexHindi;
    colonChar = 'ः';
  }

  const hasColon = colonIndex !== -1;
  const beforeColon = hasColon ? news.title.substring(0, colonIndex).trim() : news.title;
  const afterColon = hasColon ? news.title.substring(colonIndex + 1).trim() : '';

  const handleShare = () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Redirect to login with message
      navigate('/login', { 
        state: { 
          message: 'समाचार शेयर करने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: window.location.pathname
        } 
      });
      return;
    }

    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description || news.title,
        url: window.location.href
      }).catch(err => console.log('Error sharing', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('लिंक कॉपी हो गया!');
    }
  };

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      const newsId = news.id || news._id;
      if (!newsId) return;

      const token = localStorage.getItem('userToken');
      
      // If authenticated, check via API
      if (token) {
        try {
          const { checkBookmark } = await import('../services/bookmarkService');
          const bookmarked = await checkBookmark(newsId);
          setIsBookmarked(bookmarked);
          
          // Also sync with localStorage
          if (bookmarked) {
            const { addToBookmarks } = await import('../utils/bookmarkUtils');
            addToBookmarks(newsId);
          }
        } catch (error) {
          console.error('Error checking bookmark:', error);
          // Fallback to localStorage
          setIsBookmarked(isNewsBookmarked(newsId));
        }
      } else {
        // Use localStorage if not authenticated
        setIsBookmarked(isNewsBookmarked(newsId));
      }
    };

    checkBookmarkStatus();

    // Listen for bookmark changes
    const handleBookmarkChange = (event) => {
      const newsId = news.id || news._id;
      if (event.detail?.newsId === newsId) {
        setIsBookmarked(event.detail.isBookmarked);
      }
    };

    window.addEventListener('bookmarksChanged', handleBookmarkChange);
    return () => {
      window.removeEventListener('bookmarksChanged', handleBookmarkChange);
    };
  }, [news.id, news._id]);

  const handleSave = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Redirect to login with message
      navigate('/login', { 
        state: { 
          message: 'समाचार सेव करने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: window.location.pathname
        } 
      });
      setShowMenu(false);
      return;
    }

    const newsId = news.id || news._id;
    if (!newsId) return;

    try {
      if (isInBookmarkPage) {
        // Remove from bookmarks
        const { removeBookmark } = await import('../services/bookmarkService');
        await removeBookmark(newsId);
        setIsBookmarked(false);
        showToast('बुकमार्क से हटा दिया गया!', 'success');

        // Dispatch custom event to refresh bookmark list
        window.dispatchEvent(new CustomEvent('bookmarksChanged', {
          detail: { newsId, isBookmarked: false }
        }));
      } else {
        // Add to bookmarks
        const bookmarked = await toggleBookmark(newsId);
        setIsBookmarked(bookmarked);
        if (bookmarked) {
          showToast('समाचार सेव हो गया!', 'success');
        } else {
          showToast('समाचार सेव हटा दिया गया!', 'info');
        }
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      // If unauthorized, redirect to login
      if (error.message && (error.message.includes('authenticated') || error.message.includes('authorization') || error.message.includes('token'))) {
        navigate('/login', { 
          state: { 
            message: 'समाचार सेव करने के लिए कृपया लॉगिन करें या साइन अप करें',
            redirectTo: window.location.pathname
          } 
        });
      } else {
        showToast('त्रुटि हुई, कृपया पुनः प्रयास करें', 'error');
      }
    }
    setShowMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);


  const handleCardClick = () => {
    const newsId = news.id || news._id;
    if (newsId) {
      navigate(`/news/${newsId}`);
    }
  };

  const handleVideoClick = (e) => {
    e.stopPropagation(); // Prevent card click navigation
    if (isVideo && news.videoUrl) {
      // Navigate to shorts page with video ID
      const newsId = news.id || news._id;
      if (newsId) {
        navigate(`/shorts?video=${newsId}`);
      }
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-100 py-3 sm:py-4 mb-0 mx-0 overflow-hidden">
        {/* Media and Heading Stacked */}
        <div className="flex flex-col gap-3 cursor-pointer" onClick={handleCardClick}>
      
        <div className="w-full">
            {/* Title: Before Colon Colored, After Colon Black */}
            <h3 className="text-base sm:text-lg font-semibold leading-snug mt-2">
              {hasColon ? (
                <>
                  <span style={{ color: headingColor }}>{beforeColon}</span>
                  {afterColon && (
                    <>
                      <span className="text-black"> {colonChar} </span>
                      <span className="text-black">{afterColon}</span>
                    </>
                  )}
                </>
              ) : (
                <span style={{ color: headingColor }}>{beforeColon}</span>
              )}
            </h3>
          </div>
          <div
            className={`w-full aspect-video rounded-lg overflow-hidden relative bg-gray-100 ${isVideo ? 'cursor-pointer' : ''}`}
            onClick={isVideo ? handleVideoClick : undefined}
          >
            {isVideo && news.videoUrl ? (
              <>
                {/* Video Preview - GIF jaisa (fast speed, chhota portion loop) */}
                <LazyVideo
                  ref={videoRef}
                  src={news.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  style={{ pointerEvents: 'none' }}
                  onLoad={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 2.0; // Fast speed (2x)
                      // Actual video duration (original, speed badhane se pehle)
                      const actualDuration = videoRef.current.duration;
                      if (actualDuration) {
                        setVideoDuration(formatDuration(actualDuration));
                      }
                    }
                  }}
                />

                {/* Duration Badge - Real video duration (original, without speed) */}
                {(videoDuration || news.duration) && (
                  <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 bg-black bg-opacity-70 text-white text-xs sm:text-sm px-2 py-1 rounded">
                    {videoDuration || news.duration}
                  </div>
                )}
              </>
            ) : news.image ? (
              <LazyImage
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
                style={{ display: 'block' }}
                onError={(e) => {
                  console.error('Image failed to load:', news.image);
                }}
                errorSrc={'https://picsum.photos/400/300?random=' + news.id}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>

          {/* Bottom - Text Content */}
        
        </div>

        {/* Category and Menu - Aligned together */}
        <div className="flex items-center justify-between">
          {/* Category Badge */}
          <div className="flex items-center">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide shadow-sm"
              style={{
                backgroundColor: headingColor,
                color: '#FFFFFF'
              }}
            >
              {news.category}
            </span>
          </div>

          {/* 3 Dots Menu - Aligned with category */}
          <div className="relative" ref={menuRef}>
            {/* 3 Dots Menu Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-colors text-gray-700"
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* Share Option */}
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">शेयर करें</span>
                </button>

                {/* Save/Remove Bookmark Option */}
                <button
                  onClick={handleSave}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill={isInBookmarkPage ? "currentColor" : "none"}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">
                    {isInBookmarkPage ? 'बुकमार्क से हटाएँ' : 'सेव करें'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </>
  );
}

export default NewsCard;

