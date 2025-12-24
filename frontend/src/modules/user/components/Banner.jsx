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

  // Use placeholder banner if no banners found
  const getPlaceholderBanner = () => {
    // Random placeholder banner from picsum.photos (16:9 to match news cards)
    const randomId = Math.floor(Math.random() * 1000);
    return `https://picsum.photos/1280/720?random=${randomId}`;
  };

  if (loading) {
    return null;
  }

  // Get banner from service or use placeholder
  let banner = null;

  if (banners.length > 0) {
    banner = banners[0];
  }

  // Use placeholder if no banner found
  if (!banner) {
    return (
      <div className="w-full my-4 sm:my-5">
        <div className="w-full max-w-full border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="relative w-full aspect-video bg-black/5">
            <LazyImage
              src={getPlaceholderBanner()}
              alt="Advertisement"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
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
              errorSrc={getPlaceholderBanner()}
            />
          ) : (
            <LazyImage
              src={getPlaceholderBanner()}
              alt="Advertisement"
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
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

