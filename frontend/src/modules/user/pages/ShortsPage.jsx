import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllNews } from '../services/newsService';
import logo from '../assets/samachar-logo.png';
import BottomNavbar from '../components/BottomNavbar';
import LazyImage from '../../../components/LazyImage';
import LazyVideo from '../../../components/LazyVideo';

function ShortsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const videoIdFromUrl = searchParams.get('video');
  const [videoNews, setVideoNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const videoNewsRef = useRef([]);
  const [isPlaying, setIsPlaying] = useState({});
  const [isMuted, setIsMuted] = useState({});
  const [disableScroll, setDisableScroll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep ref in sync with videoNews
  useEffect(() => {
    videoNewsRef.current = videoNews;
  }, [videoNews]);

  // Fetch video news from API
  useEffect(() => {
    const fetchVideoNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all news with a higher limit to get all videos
        const response = await getAllNews({ limit: 100 });
        
        // Filter for videos only (news items with videoUrl)
        const videos = (response.data || []).filter(news => news.videoUrl && news.videoUrl.trim() !== '');
        
        setVideoNews(videos);
        
        // If video ID is in URL, find and scroll to that video
        if (videoIdFromUrl && videos.length > 0) {
          const videoIndex = videos.findIndex(v => {
            const videoId = v.id?.toString() || v._id?.toString();
            return videoId === videoIdFromUrl;
          });
          
          if (videoIndex !== -1) {
            setCurrentIndex(videoIndex);
            // Disable scrolling when coming from content
            setDisableScroll(true);
            // Scroll to the video after a short delay to ensure DOM is ready
            setTimeout(() => {
              const container = containerRef.current;
              if (container) {
                const videoElement = container.querySelector(`[data-video-id="${videoIdFromUrl}"]`);
                if (videoElement) {
                  videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  // Auto-play the video after scrolling
                  setTimeout(() => {
                    const video = videoRefs.current[videoIdFromUrl];
                    if (video) {
                      video.muted = true; // Ensure muted for autoplay
                      setIsMuted(prev => ({ ...prev, [videoIdFromUrl]: true }));
                      video.play().catch(() => { });
                      setIsPlaying(prev => ({ ...prev, [videoIdFromUrl]: true }));
                    }
                  }, 500);
                }
              }
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error fetching video news:', err);
        setError(err.message || 'वीडियो लोड करने में त्रुटि हुई');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoNews();
  }, [videoIdFromUrl]);

  // Disable scroll when video is opened from content
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !disableScroll) return;

    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Prevent all scroll events
    container.addEventListener('wheel', preventScroll, { passive: false });
    container.addEventListener('touchmove', preventScroll, { passive: false });
    container.style.overflow = 'hidden';

    return () => {
      container.removeEventListener('wheel', preventScroll);
      container.removeEventListener('touchmove', preventScroll);
      container.style.overflow = '';
    };
  }, [disableScroll]);

  // Handle scroll to detect which video is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || videoNews.length === 0 || disableScroll) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const videos = container.querySelectorAll('.video-item');
      const viewportCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      videos.forEach((videoEl, index) => {
        const videoRect = videoEl.getBoundingClientRect();
        const videoCenter = videoRect.top + videoRect.height / 2;
        const distance = Math.abs(viewportCenter - videoCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      // Update current index
      setCurrentIndex(prevIndex => {
        if (prevIndex !== closestIndex) {
          return closestIndex;
        }
        return prevIndex;
      });

      // Play closest video, pause others
      videos.forEach((videoEl, index) => {
        // Get video ID from data attribute instead of array
        const videoId = videoEl.getAttribute('data-video-id');
        if (!videoId) return;

        const videoElement = videoRefs.current[videoId];
        if (!videoElement) return;

        const videoRect = videoEl.getBoundingClientRect();
        const isInView =
          videoRect.top < containerRect.bottom &&
          videoRect.bottom > containerRect.top &&
          Math.abs((videoRect.top + videoRect.height / 2) - viewportCenter) < containerRect.height / 2;

        if (isInView && index === closestIndex) {
          videoElement.play().catch(() => { });
          setIsPlaying(prev => ({ ...prev, [videoId]: true }));
        } else {
          videoElement.pause();
          setIsPlaying(prev => ({ ...prev, [videoId]: false }));
          // Mute inactive videos
          videoElement.muted = true;
          setIsMuted(prev => ({ ...prev, [videoId]: true }));
        }
      });
    };

    // Throttle scroll events for better performance
    let scrollTimeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null;
      }, 100);
    };

    container.addEventListener('scroll', throttledHandleScroll);
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [videoNews.length, disableScroll]);

  // Auto-play first video on mount (only if not coming from URL)
  useEffect(() => {
    if (videoNews.length === 0 || videoIdFromUrl || disableScroll) return;
    
    const firstNews = videoNewsRef.current[0];
    const firstVideoId = firstNews?.id || firstNews?._id;
    if (!firstVideoId) return;
    
    const timeoutId = setTimeout(() => {
      const videoElement = videoRefs.current[firstVideoId];
      if (videoElement) {
        videoElement.muted = true; // Ensure muted for autoplay
        setIsMuted(prev => ({ ...prev, [firstVideoId]: true }));
        videoElement.play().catch(() => { });
        setIsPlaying(prev => ({ ...prev, [firstVideoId]: true }));
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [videoNews.length, videoIdFromUrl, disableScroll]);

  const handleShare = (news) => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Redirect to login with message
      navigate('/login', { 
        state: { 
          message: 'वीडियो शेयर करने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: window.location.pathname + window.location.search
        } 
      });
      return;
    }

    const newsId = news.id || news._id;
    const shareUrl = `${window.location.origin}/shorts?video=${newsId}`;
    
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description || news.subtitleText || '',
        url: shareUrl
      }).catch(() => { });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('लिंक कॉपी हो गया!');
      }).catch(() => {
        // Fallback if clipboard API fails
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('लिंक कॉपी हो गया!');
      });
    }
  };

  const handleDownload = async (news) => {
    if (!news.videoUrl) {
      alert('डाउनलोड उपलब्ध नहीं है');
      return;
    }

    try {
      // Fetch the video file
      const response = await fetch(news.videoUrl);
      if (!response.ok) {
        throw new Error('वीडियो डाउनलोड करने में त्रुटि');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const newsId = news.id || news._id;
      const fileName = news.title 
        ? `${news.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}_${newsId}.mp4`
        : `news_${newsId}.mp4`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: Try direct download
      const link = document.createElement('a');
      link.href = news.videoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReadNews = (newsId) => {
    if (newsId) {
      navigate(`/news/${newsId}`);
    }
  };

  const handleVideoClick = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      // If video is paused, play it and unmute
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(prev => ({ ...prev, [videoId]: true }));
        // Enable audio on first interaction
        videoElement.muted = false;
        setIsMuted(prev => ({ ...prev, [videoId]: false }));
      } else {
        // If video is playing, pause it
        videoElement.pause();
        setIsPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    }
  };

  const handleMuteToggle = (videoId, e) => {
    // Prevent event bubbling to avoid triggering video click
    e.stopPropagation();

    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      const newMutedState = !videoElement.muted;
      videoElement.muted = newMutedState;
      setIsMuted(prev => ({ ...prev, [videoId]: newMutedState }));
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">वीडियो लोड हो रहे हैं...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            पुनः प्रयास करें
          </button>
        </div>
      </div>
    );
  }

  // No videos state
  if (videoNews.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white text-lg mb-4">कोई वीडियो उपलब्ध नहीं है</p>
          <button
            onClick={() => navigate('/')}
            className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            होम पर जाएं
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative animate-fade-in">
      {/* Header with Arrow, Logo, and Share */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent pt-2 pb-4 px-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Arrow and Logo together */}
          <div className="flex items-center gap-0">
            {/* Back Arrow */}
            <button
              onClick={() => navigate(-1)}
              className="text-white hover:opacity-80 transition-opacity p-0"
              aria-label="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex-shrink-0 h-16 sm:h-20 md:h-24 w-auto -ml-1">
              <LazyImage
                src={logo}
                alt="हमारा समाचार"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side - Read News Button */}
          {videoNews[currentIndex] && (
            <button
              onClick={() => {
                const currentNews = videoNews[currentIndex];
                const newsId = currentNews.id || currentNews._id;
                handleReadNews(newsId);
              }}
              className="flex items-center gap-1.5 bg-white text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>समाचार पढ़ें</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Container - Scrollable like Instagram Reels */}
      <div
        ref={containerRef}
        className={`h-full w-full ${disableScroll ? 'overflow-hidden' : 'overflow-y-scroll snap-y snap-mandatory'} scrollbar-hide scroll-smooth`}
        style={{ scrollBehavior: disableScroll ? 'auto' : 'smooth' }}
      >
        {videoNews.map((news, index) => {
          const newsId = news.id || news._id;
          if (!newsId) return null;
          
          return (
            <div
              key={newsId}
              data-video-id={newsId}
              className="video-item h-[100dvh] w-full snap-start snap-always relative flex items-center justify-center bg-black pb-[80px]"
            >
              {/* Video */}
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={(el) => {
                    if (el) {
                      videoRefs.current[newsId] = el;
                      // Ensure video loops properly
                      el.loop = true;
                      // Handle video end to restart loop (backup for loop attribute)
                      const handleEnded = () => {
                        el.currentTime = 0;
                        if (!el.paused) {
                          el.play().catch(() => { });
                        }
                      };
                      el.addEventListener('ended', handleEnded);
                      
                      // Cleanup function stored for later removal if needed
                      el._loopHandler = handleEnded;
                    } else {
                      // Cleanup when element is removed
                      const oldEl = videoRefs.current[newsId];
                      if (oldEl && oldEl._loopHandler) {
                        oldEl.removeEventListener('ended', oldEl._loopHandler);
                      }
                      delete videoRefs.current[newsId];
                    }
                  }}
                  src={news.videoUrl}
                  className="w-full h-full object-contain"
                  loop
                  muted
                  playsInline
                  preload="auto"
                  onClick={() => handleVideoClick(newsId)}
                  onError={(e) => {
                    console.error('Video load error:', e);
                    e.target.style.display = 'none';
                  }}
                  onLoadedMetadata={(e) => {
                    // Ensure loop is set when metadata loads
                    e.target.loop = true;
                  }}
                />

                {/* Play/Pause Overlay */}
                {!isPlaying[newsId] && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                    onClick={() => handleVideoClick(newsId)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}

              {/* Category on Left Bottom */}
              <div className="absolute bottom-[45px] left-4 z-40 transition-all duration-300">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900/80 text-white text-sm sm:text-base font-semibold rounded-full backdrop-blur-md border border-white/10 shadow-lg hover:bg-neutral-800 transition-colors cursor-pointer">
                  {news.category}
                  <span className="text-xs opacity-70">›</span>
                </span>
              </div>

              {/* Right Bottom - Download and Share Buttons (Vertical) */}
              <div className="absolute bottom-32 right-3 z-40 flex flex-col gap-4">
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(news)}
                  className="group flex flex-col items-center gap-1 text-white transition-transform active:scale-95"
                  aria-label="Download"
                >
                  <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-black/60 transition-colors shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium drop-shadow-md opacity-90">डाउनलोड</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(news)}
                  className="group flex flex-col items-center gap-1 text-white transition-transform active:scale-95"
                  aria-label="Share"
                >
                  <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-black/60 transition-colors shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium drop-shadow-md opacity-90">शेयर</span>
                </button>

                {/* Mute/Unmute Button */}
                <button
                  onClick={(e) => handleMuteToggle(newsId, e)}
                  className="group flex flex-col items-center gap-1 text-white transition-transform active:scale-95"
                  aria-label={isMuted[newsId] !== false ? "Unmute" : "Mute"}
                >
                  <div className="bg-black/40 p-2.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-black/60 transition-colors shadow-lg">
                    {isMuted[newsId] !== false ? (
                      // Muted icon (speaker with X)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      // Unmuted icon (speaker with sound waves)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 sm:h-6 sm:w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3m3 3a3 3 0 01-3 3m3-3v4"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium drop-shadow-md opacity-90">
                    {isMuted[newsId] !== false ? "अनम्यूट" : "म्यूट"}
                  </span>
                </button>
              </div>

            </div>
          </div>
        );
        })}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default ShortsPage;

