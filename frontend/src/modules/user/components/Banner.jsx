import { useState, useEffect } from 'react';
import { getBanners } from '../services/newsService';
import LazyImage from '../../../components/LazyImage';

function Banner({ position = 'news_feed', category = null }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, [position, category]);

  const loadBanners = async () => {
    try {
      // Use user endpoint which doesn't require authentication
      const allBanners = await getBanners(position, category);
      setBanners(allBanners || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      // Set empty array on error to show placeholder
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (banner) => {
    // Track click
    if (banner.link) {
      if (banner.target === '_blank') {
        window.open(banner.link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = banner.link;
      }
    }
  };

  if (loading) {
    return null;
  }

  // Only show banner if real banners are available from admin
  if (!banners || banners.length === 0) {
    return null; // Don't show any advertisement if no real banners are added by admin
  }

  // Get first banner from service
  const banner = banners[0];

  // Double-check banner has required data
  if (!banner || (!banner.imageUrl && !banner.videoUrl)) {
    return null; // Don't show incomplete banners
  }

  return (
    <div className="w-full my-4 sm:my-5">
      <div className="w-full max-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div 
          className="relative w-full aspect-video cursor-pointer bg-black/5"
          onClick={() => handleBannerClick(banner)}
        >
          {banner.videoUrl ? (
            <video
              src={banner.videoUrl}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-black"
              playsInline
            />
          ) : banner.imageUrl ? (
            <LazyImage
              src={banner.imageUrl}
              alt={banner.title || 'Advertisement'}
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : null}
        </div>
        {/* Category Badge Below Banner */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex justify-center">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide shadow-sm inline-block"
            style={{
              backgroundColor: '#666666',
              color: '#FFFFFF'
            }}
          >
            विज्ञापन
          </span>
        </div>
      </div>
    </div>
  );
}

export default Banner;

