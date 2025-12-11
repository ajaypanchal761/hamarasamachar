import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllNews } from '../data/dummyNewsData';
import logo from '../assets/samachar-logo.png';
import BottomNavbar from '../components/BottomNavbar';

function ShortsPage() {
  const navigate = useNavigate();
  const [videoNews, setVideoNews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [isPlaying, setIsPlaying] = useState({});

  useEffect(() => {
    // Get all video news items
    const allNews = getAllNews();
    const videos = allNews.filter(news => news.type === 'video' && news.videoUrl);
    setVideoNews(videos);
  }, []);

  // Handle scroll to detect which video is in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || videoNews.length === 0) return;

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
      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }

      // Play closest video, pause others
      videos.forEach((videoEl, index) => {
        const videoId = videoNews[index]?.id;
        if (!videoId) return;
        
        const videoElement = videoRefs.current[videoId];
        if (!videoElement) return;
        
        const videoRect = videoEl.getBoundingClientRect();
        const isInView = 
          videoRect.top < containerRect.bottom &&
          videoRect.bottom > containerRect.top &&
          Math.abs((videoRect.top + videoRect.height / 2) - viewportCenter) < containerRect.height / 2;

        if (isInView && index === closestIndex) {
          videoElement.play().catch(() => {});
          setIsPlaying(prev => ({ ...prev, [videoId]: true }));
        } else {
          videoElement.pause();
          setIsPlaying(prev => ({ ...prev, [videoId]: false }));
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
  }, [videoNews, currentIndex]);

  // Auto-play first video on mount
  useEffect(() => {
    if (videoNews.length > 0) {
      const firstVideoId = videoNews[0]?.id;
      if (firstVideoId) {
        setTimeout(() => {
          const videoElement = videoRefs.current[firstVideoId];
          if (videoElement) {
            videoElement.play().catch(() => {});
            setIsPlaying(prev => ({ ...prev, [firstVideoId]: true }));
          }
        }, 100);
      }
    }
  }, [videoNews]);

  const handleShare = (news) => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: news.description,
        url: window.location.origin + `/news/${news.id}`
      }).catch(() => {});
    } else {
      // Fallback: Copy to clipboard
      const url = window.location.origin + `/news/${news.id}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('लिंक कॉपी हो गया!');
      });
    }
  };

  const handleDownload = (news) => {
    // TODO: Implement download functionality
    if (news.videoUrl) {
      // For video download
      const link = document.createElement('a');
      link.href = news.videoUrl;
      link.download = `news_${news.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('डाउनलोड उपलब्ध नहीं है');
    }
  };

  const handleReadNews = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  const handleVideoClick = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setIsPlaying(prev => ({ ...prev, [videoId]: true }));
      } else {
        videoElement.pause();
        setIsPlaying(prev => ({ ...prev, [videoId]: false }));
      }
    }
  };

  if (videoNews.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">वीडियो लोड हो रहे हैं...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
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
              <img
                src={logo}
                alt="हमारा समाचार"
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side - Read News Button */}
          {videoNews[currentIndex] && (
            <button
              onClick={() => handleReadNews(videoNews[currentIndex].id)}
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
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {videoNews.map((news, index) => (
          <div
            key={news.id}
            className="video-item h-screen w-full snap-start snap-always relative flex items-center justify-center bg-black"
          >
            {/* Video */}
            <div className="relative w-full h-full">
              <video
                ref={(el) => {
                  if (el) videoRefs.current[news.id] = el;
                }}
                src={news.videoUrl}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="auto"
                onClick={() => handleVideoClick(news.id)}
              />

              {/* Play/Pause Overlay */}
              {!isPlaying[news.id] && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={() => handleVideoClick(news.id)}
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
              <div className="absolute bottom-20 left-4 z-40">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur-sm border border-white/30 drop-shadow-lg">
                  {news.category}
                  <span className="text-xs">›</span>
                </span>
              </div>

              {/* Right Bottom - Download and Share Buttons (Vertical) */}
              <div className="absolute bottom-40 right-4 z-40 flex flex-col gap-3">
                {/* Download Button */}
                <button
                  onClick={() => handleDownload(news)}
                  className="flex flex-col items-center text-white"
                  aria-label="Download"
                >
                  <div className="bg-black/30 p-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-black/40 transition-colors drop-shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                  <div>
                    <span className="text-[10px] font-medium">डाउनलोड</span>
                  </div>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(news)}
                  className="flex flex-col items-center text-white"
                  aria-label="Share"
                >
                  <div className="bg-black/30 p-2 rounded-full backdrop-blur-sm border border-white/20 hover:bg-black/40 transition-colors drop-shadow-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                  <div>
                    <span className="text-[10px] font-medium">शेयर</span>
                  </div>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default ShortsPage;

