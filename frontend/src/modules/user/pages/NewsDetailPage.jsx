import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById, getContentSections } from '../data/dummyNewsData';
import BottomNavbar from '../components/BottomNavbar';
import ContentSection from '../components/ContentSection';
import { toggleBookmark, isNewsBookmarked } from '../utils/bookmarkUtils';

function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const videoRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const userMobileNumber = localStorage.getItem('userMobileNumber');
      const userProfile = localStorage.getItem('userProfile');
      setIsLoggedIn(!!(userMobileNumber || userProfile));
    };

    checkLoginStatus();
    
    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    // Also check when page regains focus (in case user logs in and navigates back)
    window.addEventListener('focus', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('focus', checkLoginStatus);
    };
  }, []);

  // Prevent scrolling on blurred content when not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      const handleScroll = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const handleTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };

      const contentContainer = document.querySelector('.content-sections-container');
      if (contentContainer) {
        contentContainer.addEventListener('scroll', handleScroll, { passive: false });
        contentContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        contentContainer.addEventListener('wheel', handleScroll, { passive: false });
      }

      return () => {
        if (contentContainer) {
          contentContainer.removeEventListener('scroll', handleScroll);
          contentContainer.removeEventListener('touchmove', handleTouchMove);
          contentContainer.removeEventListener('wheel', handleScroll);
        }
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const newsItem = getNewsById(id);
    if (newsItem) {
      setNews(newsItem);
      setIsBookmarked(isNewsBookmarked(newsItem.id));
    } else {
      navigate('/category/breaking');
    }
  }, [id, navigate]);

  // Format duration in MM:SS format
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Video setup for GIF-like preview
  useEffect(() => {
    const video = videoRef.current;
    if (!news || news.type !== 'video' || !video || !news.videoUrl) return;
    
    let handleTimeUpdate = null;
    
    const setupVideo = () => {
      video.playbackRate = 2.0; // Fast speed (2x)
      
      if (video.duration && video.duration < 30) {
        // Short video - full loop
      } else {
        // Long video - 30 second loop
        handleTimeUpdate = () => {
          if (video.currentTime >= 30) {
            video.currentTime = 0;
          }
        };
        video.addEventListener('timeupdate', handleTimeUpdate);
      }
    };
    
    if (video.readyState >= 2 && video.duration) {
      setupVideo();
    } else {
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
  }, [news]);

  const categoryColors = {
    'ब्रेकिंग': '#E21E26',
    'राजनीति': '#1E88E5',
    'क्राइम': '#D32F2F',
    'नेशनल': '#F57C00',
    'राजस्थान': '#E21E26',
    'लाइफस्टाइल': '#9C27B0',
    'default': '#666666'
  };

  const headingColor = news ? (categoryColors[news.category] || categoryColors['default']) : '#666666';

  // Split title by colon
  const colonIndexEng = news?.title.indexOf(':') ?? -1;
  const colonIndexHindi = news?.title.indexOf('ः') ?? -1;
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
  const beforeColon = hasColon ? news?.title.substring(0, colonIndex).trim() : news?.title;
  const afterColon = hasColon ? news?.title.substring(colonIndex + 1).trim() : '';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        text: news?.description || news?.title,
        url: window.location.href
      }).catch(err => console.log('Error sharing', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('लिंक कॉपी हो गया!');
    }
    setShowMenu(false);
  };

  const handleSave = () => {
    if (!news) return;
    const bookmarked = toggleBookmark(news.id);
    setIsBookmarked(bookmarked);
    if (bookmarked) {
      alert('समाचार सेव हो गया!');
    } else {
      alert('समाचार सेव हटा दिया गया!');
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

  if (!news) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">समाचार लोड हो रहा है...</p>
      </div>
    );
  }

  // Get content sections from news data using helper function
  const contentSections = getContentSections(news);

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
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">{news?.category || 'समाचार'}</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-4">
        {/* Heading */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
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
        </h1>

        {/* Video/Photo Section */}
        <div className="mb-4 sm:mb-5">
          <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden relative bg-gray-200">
            {news.type === 'video' && news.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={news.videoUrl}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  style={{ pointerEvents: 'none' }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.playbackRate = 2.0;
                      const actualDuration = videoRef.current.duration;
                      if (actualDuration) {
                        setVideoDuration(formatDuration(actualDuration));
                      }
                    }
                  }}
                />
                {(videoDuration || news.duration) && (
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black bg-opacity-70 text-white text-sm sm:text-base px-2 sm:px-3 py-1 sm:py-1.5 rounded">
                    {videoDuration || news.duration}
                  </div>
                )}
              </>
            ) : news.image ? (
              <img
                src={news.image}
                alt={news.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://picsum.photos/800/400?random=' + news.id;
                }}
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="flex items-center justify-end mb-4 sm:mb-5">
          {/* 3 Dots Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
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

            {showMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-40 sm:w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
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
                <button
                  onClick={handleSave}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 transition-colors text-left text-gray-700"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span className="text-sm sm:text-base font-medium">सेव करें</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Author and Date Info */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 text-xs sm:text-sm text-gray-600">
          {news.author && (
            <span>द्वारा: {news.author}</span>
          )}
          {news.date && (
            <span>• {new Date(news.date).toLocaleDateString('hi-IN')}</span>
          )}
          {news.timeAgo && (
            <span>• {news.timeAgo}</span>
          )}
        </div>

        {/* Content Sections - Show first section, then blur rest if not logged in */}
        <div className="space-y-4 sm:space-y-5">
          {/* Show first paragraph without blur */}
          {contentSections.slice(0, !isLoggedIn ? 1 : contentSections.length).map((section, index) => (
            <ContentSection
              key={index}
              section={section}
              onShare={handleShare}
              newsId={news.id}
            />
          ))}
          
          {/* Show remaining content with blur if not logged in */}
          {!isLoggedIn && contentSections.length > 1 && (
            <div 
              className="content-sections-container space-y-4 sm:space-y-5 relative blur-md overflow-hidden"
              style={{ maxHeight: '150px', pointerEvents: 'none', touchAction: 'none' }}
            >
              {contentSections.slice(1).map((section, index) => (
                <ContentSection
                  key={index + 1}
                  section={section}
                  onShare={handleShare}
                  newsId={news.id}
                />
              ))}
            </div>
          )}
          
          {/* Show all content if logged in */}
          {isLoggedIn && contentSections.slice(1).map((section, index) => (
            <ContentSection
              key={index + 1}
              section={section}
              onShare={handleShare}
              newsId={news.id}
            />
          ))}
          
          {/* Lock Section - Show if not logged in */}
          {!isLoggedIn && (
            <div className="flex flex-col items-center gap-4 py-4 sm:py-6 mt-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
              <p className="text-lg sm:text-xl font-bold text-gray-900 text-center px-4">
                ज्यादा खबरें पढ़ने के लिए लॉगिन करें
              </p>
              <p className="text-sm sm:text-base text-gray-600 text-center px-4">
                लॉगिन करने के बाद आप बिना रुकावट खबरें पढ़ पाएंगे
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 w-full max-w-xs sm:max-w-sm bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-colors shadow-md"
              >
                आगे बढ़ें
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default NewsDetailPage;

