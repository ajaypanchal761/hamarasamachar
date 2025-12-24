import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNewsById as fetchNewsById } from '../services/newsService';
import BottomNavbar from '../components/BottomNavbar';
import ContentSection from '../components/ContentSection';
import LazyImage from '../../../components/LazyImage';
import LazyVideo from '../../../components/LazyVideo';

function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoDuration, setVideoDuration] = useState(null);
  const videoRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const userToken = localStorage.getItem('userToken');
      const userData = localStorage.getItem('userData');
      setIsLoggedIn(!!(userToken || userData));
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

  // Fetch news from API
  useEffect(() => {
    const loadNews = async () => {
      if (!id) {
        setError('Invalid news ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const newsData = await fetchNewsById(id);
        if (newsData) {
          setNews(newsData);
        } else {
          setError('समाचार नहीं मिला');
        }
      } catch (err) {
        console.error('Error loading news:', err);
        setError(err.message || 'समाचार लोड करने में विफल');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [id]);

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
  };

  // Helper function to parse HTML content and convert to sections
  const parseHTMLContent = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') return [];
    
    const sections = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Process all child nodes
    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          sections.push({
            type: 'paragraph',
            content: text
          });
        }
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const tagName = node.tagName?.toLowerCase();
      
      switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          const headingText = node.textContent?.trim();
          if (headingText) {
            sections.push({
              type: 'heading',
              content: headingText
            });
          }
          break;
          
        case 'p':
          const paraText = node.textContent?.trim();
          if (paraText) {
            sections.push({
              type: 'paragraph',
              content: paraText
            });
          }
          break;
          
        case 'img':
          const imgSrc = node.getAttribute('src');
          const imgAlt = node.getAttribute('alt') || '';
          if (imgSrc) {
            sections.push({
              type: 'image',
              url: imgSrc,
              alt: imgAlt
            });
          }
          break;
          
        case 'video':
          const videoSrc = node.getAttribute('src');
          if (videoSrc) {
            sections.push({
              type: 'video',
              url: videoSrc
            });
          }
          break;
          
        case 'ul':
        case 'ol':
          const listItems = Array.from(node.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean);
          if (listItems.length > 0) {
            sections.push({
              type: 'bullet',
              items: listItems
            });
          }
          break;
          
        case 'blockquote':
          const quoteText = node.textContent?.trim();
          if (quoteText) {
            sections.push({
              type: 'paragraph',
              content: quoteText,
              isQuote: true
            });
          }
          break;
          
        case 'div':
        case 'span':
          // For div and span, process children but also check if it has direct text content
          const directText = Array.from(node.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent?.trim())
            .filter(Boolean)
            .join(' ');
          
          if (directText) {
            sections.push({
              type: 'paragraph',
              content: directText
            });
          }
          
          // Process child elements
          Array.from(node.childNodes).forEach(processNode);
          break;
          
        default:
          // For other elements, process children
          Array.from(node.childNodes).forEach(processNode);
          break;
      }
    };
    
    // Process all top-level nodes
    Array.from(tempDiv.childNodes).forEach(processNode);
    
    return sections;
  };

  // Helper function to get content sections from news data
  const getContentSections = (newsItem) => {
    if (!newsItem) return [];
    
    // Helper function to strip HTML tags and clean text
    const stripHtmlTags = (html) => {
      if (!html) return '';
      // Remove HTML tags but keep the text content
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    // Helper to check if URL matches featured media
    const isFeaturedMedia = (url, featuredUrl) => {
      if (!url || !featuredUrl) return false;
      // Compare URLs (handle both full URLs and relative paths)
      return url === featuredUrl || url.includes(featuredUrl) || featuredUrl.includes(url);
    };
    
    const sections = [];
    
    // PRIORITY 1: If contentSections exist in database, use them (but filter out featured image/video)
    if (newsItem.contentSections && Array.isArray(newsItem.contentSections) && newsItem.contentSections.length > 0) {
      const filteredSections = newsItem.contentSections.filter(section => {
        if (section.type === 'image' && isFeaturedMedia(section.url, newsItem.image)) {
          return false; // Skip featured image
        }
        if (section.type === 'video' && isFeaturedMedia(section.url, newsItem.videoUrl)) {
          return false; // Skip featured video
        }
        // Strip HTML tags from paragraph content
        if (section.type === 'paragraph' && section.content) {
          section.content = stripHtmlTags(section.content);
        }
        return true;
      });
      
      if (filteredSections.length > 0) {
        return filteredSections;
      }
    }
    
    // PRIORITY 2: Parse content field (admin panel में जो HTML content save होता है)
    if (newsItem.content && typeof newsItem.content === 'string' && newsItem.content.trim()) {
      const hasHtmlTags = /<[^>]*>/g.test(newsItem.content);
      
      if (hasHtmlTags) {
        // Check if content has rich formatting (bold, links, images, etc.)
        const hasRichFormatting = /<(strong|b|em|i|u|a|code|img|video|table|ul|ol|blockquote|h[1-6])/i.test(newsItem.content);
        
        if (hasRichFormatting) {
          // Has rich formatting - render directly as HTML to preserve all formatting
          sections.push({
            type: 'html',
            content: newsItem.content
          });
        } else {
          // Simple HTML tags but no rich formatting - parse into sections
          const parsedSections = parseHTMLContent(newsItem.content);
          // Filter out featured image/video from parsed sections
          const filteredSections = parsedSections.filter(section => {
            if (section.type === 'image' && isFeaturedMedia(section.url, newsItem.image)) {
              return false;
            }
            if (section.type === 'video' && isFeaturedMedia(section.url, newsItem.videoUrl)) {
              return false;
            }
            return true;
          });
          
          if (filteredSections.length > 0) {
            sections.push(...filteredSections);
          }
        }
      } else {
        // Plain text content - add as paragraph
        const cleanContent = newsItem.content.trim();
        if (cleanContent) {
          sections.push({
            type: 'paragraph',
            content: cleanContent
          });
        }
      }
    }
    
    // PRIORITY 3: Fallback to description/subtitleText if no content
    if (sections.length === 0) {
      // Add heading
      sections.push({
        type: 'heading',
        content: 'मुख्य बातें'
      });
      
      // Add description if available
      if (newsItem.description) {
        const cleanDescription = stripHtmlTags(newsItem.description);
        if (cleanDescription.trim()) {
          sections.push({
            type: 'paragraph',
            content: cleanDescription
          });
        }
      }
      
      // Add subtitleText if available
      if (newsItem.subtitleText && newsItem.subtitleText !== newsItem.description) {
        const cleanSubtitle = stripHtmlTags(newsItem.subtitleText);
        if (cleanSubtitle.trim() && cleanSubtitle !== stripHtmlTags(newsItem.description)) {
          sections.push({
            type: 'paragraph',
            content: cleanSubtitle
          });
        }
      }
      
      // If no sections created (only heading), add a default message
      if (sections.length === 1) {
        sections.push({
          type: 'paragraph',
          content: newsItem.title || 'समाचार की विस्तृत जानकारी उपलब्ध नहीं है।'
        });
      }
    }
    
    return sections;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E21E26] mx-auto mb-4"></div>
          <p className="text-gray-500">समाचार लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !news) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 mb-4">{error || 'समाचार नहीं मिला'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#C21A20] transition-colors"
          >
            वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  // Get content sections from news data
  const contentSections = getContentSections(news);

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
          <h2 className="text-sm sm:text-base font-semibold text-white">{news?.category || 'समाचार'}</h2>
          <div className="w-6 sm:w-8"></div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-5 md:px-6 py-4 sm:py-5">
          {/* Heading */}
          {/* Heading */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-5 leading-snug tracking-tight text-gray-900">
            {hasColon ? (
              <>
                <span className="text-[#E21E26] block mb-1.5 text-base sm:text-lg font-bold uppercase tracking-wider opacity-90">{beforeColon}</span>
                <span className="text-gray-900">{afterColon}</span>
              </>
            ) : (
              <span style={{ color: headingColor }}>{beforeColon}</span>
            )}
          </h1>

          {/* Video/Photo Section */}
          <div className="mb-4 sm:mb-5 border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div 
              className={`w-full h-48 sm:h-64 md:h-80 lg:h-96 relative bg-gray-200 ${news.type === 'video' && news.videoUrl ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (news.type === 'video' && news.videoUrl) {
                  const newsId = news.id || news._id;
                  if (newsId) {
                    navigate(`/shorts?video=${newsId}`);
                  }
                }
              }}
            >
              {news.type === 'video' && news.videoUrl ? (
                <>
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
                <LazyImage
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                  errorSrc={'https://picsum.photos/800/400?random=' + news.id}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>
            
            {/* Share Button below Video/Image */}
            {news.type === 'video' && news.videoUrl && (
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium text-gray-700"
                aria-label="Share Video"
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
                <span>शेयर करें</span>
              </button>
            )}
          </div>


          {/* Author/Date Info */}
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
              {news.author && (
                <span className="font-medium text-gray-900">द्वारा: {news.author}</span>
              )}
              {(news.date || news.timeAgo) && (
                <span className="text-gray-400">•</span>
              )}
              {news.date && (
                <span>{new Date(news.date).toLocaleDateString('hi-IN')}</span>
              )}
            </div>
          </div>

          {/* Content Sections - Show first section, then blur rest if not logged in */}
          <div className="space-y-4 sm:space-y-5">
            {isLoggedIn ? (
              /* Show all content if logged in */
              contentSections.map((section, index) => (
                <ContentSection
                  key={index}
                  section={section}
                  onShare={handleShare}
                  newsId={news.id}
                />
              ))
            ) : (
              <>
                {/* Show first paragraph without blur */}
                {contentSections.slice(0, 1).map((section, index) => (
                  <ContentSection
                    key={index}
                    section={section}
                    onShare={handleShare}
                    newsId={news.id}
                  />
                ))}

                {/* Show remaining content with blur if not logged in */}
                {contentSections.length > 1 && (
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
              </>
            )}

            {/* Lock Section - Show if not logged in */}
            {!isLoggedIn && (
              <div className="relative overflow-hidden bg-gradient-to-br from-[#E21E26]/5 to-[#E21E26]/10 rounded-2xl p-6 sm:p-8 text-center border border-[#E21E26]/20 shadow-sm mt-4">
                <div className="flex flex-col items-center gap-4 relative z-10">
                  <div className="bg-white p-3 rounded-full shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[#E21E26]"
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
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      पूरी खबर पढ़ने के लिए लॉगिन करें
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto">
                      लॉगिन करें और अपने पसंदीदा विषयों पर अनलिमिटेड खबरें पढ़ें
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 w-full max-w-xs bg-[#E21E26] hover:bg-[#C21A20] text-white font-bold py-3.5 px-8 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-[#E21E26]/30 transform hover:-translate-y-0.5"
                  >
                    अभी लॉगिन करें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default NewsDetailPage;
