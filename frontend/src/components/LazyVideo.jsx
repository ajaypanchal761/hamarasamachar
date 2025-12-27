import { useRef, useState, useEffect, forwardRef } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

const LazyVideo = forwardRef(({
  src,
  className = '',
  placeholderClassName = 'bg-gray-200 animate-pulse',
  onLoad,
  onError,
  autoPlay = false,
  muted = true,
  loop = false,
  controls = false,
  playsInline = true,
  preload = 'metadata',
  ...props
}, ref) => {
  const [containerRef, shouldLoad] = useLazyLoad(0.1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  // Forward the video ref to parent
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(videoRef.current);
      } else {
        ref.current = videoRef.current;
      }
    }
  }, [ref, isLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded) return;

    // Handle video-specific setup after loading
    if (onLoad) onLoad({ target: video });
  }, [isLoaded, onLoad]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && shouldLoad && (
        <div className={`absolute inset-0 ${placeholderClassName} flex items-center justify-center`}>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Actual video - only render when shouldLoad is true */}
      {shouldLoad && (
        <video
          ref={videoRef}
          src={src}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          preload={preload}
          onLoadedData={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Fallback for when intersection observer isn't supported */}
      {!shouldLoad && !('IntersectionObserver' in window) && (
        <video
          src={src}
          className={className}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline={playsInline}
          preload="lazy"
          onLoadedData={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
});

LazyVideo.displayName = 'LazyVideo';

export default LazyVideo;
