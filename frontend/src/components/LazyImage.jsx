import { useState } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholderClassName = 'bg-gray-200 animate-pulse',
  errorSrc = 'https://picsum.photos/400/300?random=fallback',
  onLoad,
  onError,
  ...props
}) => {
  const [ref, shouldLoad] = useLazyLoad(0.1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    // Try to load fallback image
    if (e.target.src !== errorSrc) {
      e.target.src = errorSrc;
    }
    if (onError) onError(e);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Placeholder/Loading state */}
      {!isLoaded && !hasError && shouldLoad && (
        <div className={`absolute inset-0 ${placeholderClassName}`} />
      )}

      {/* Actual image - only render when shouldLoad is true */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}

      {/* Fallback for when intersection observer isn't supported */}
      {!shouldLoad && !('IntersectionObserver' in window) && (
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
