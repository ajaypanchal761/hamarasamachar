function ContentSection({ section, onShare, newsId = null }) {
  if (!section || !section.type) return null;

  const handleShare = () => {
    if (onShare) {
      onShare();
    }
  };

  switch (section.type) {
    case 'heading':
      return (
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4 mt-4 sm:mt-5 first:mt-0">
          {section.content}
        </h2>
      );

    case 'paragraph':
      return (
        <p className="text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">
          {section.content}
        </p>
      );

    case 'image':
      return (
        <div className="my-4 sm:my-5 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <img
            src={section.url}
            alt={section.alt || 'News Image'}
            className="w-full"
            onError={(e) => {
              e.target.src = `https://picsum.photos/800/400?random=${newsId || Math.random()}`;
            }}
            loading="lazy"
          />
          {/* Share Button below Image */}
          {onShare && (
            <button
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-4 bg-gray-100 hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium text-gray-700"
              aria-label="Share Image"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>शेयर करें</span>
            </button>
          )}
        </div>
      );

    case 'video':
      if (!section.url) return null;
      return (
        <div className="my-4 sm:my-5 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="w-full h-64 sm:h-80 md:h-96 relative bg-gray-200">
            <video
              src={section.url}
              className="w-full h-full object-cover"
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              style={{ pointerEvents: 'none' }}
            />
          </div>
          {/* Share Button below Video */}
          {onShare && (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>शेयर करें</span>
            </button>
          )}
        </div>
      );

    case 'bullet':
      if (!section.items || !Array.isArray(section.items)) return null;
      return (
        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base md:text-lg text-gray-800 ml-2 sm:ml-4">
          {section.items.map((item, itemIndex) => (
            <li key={itemIndex} className="leading-relaxed">{item}</li>
          ))}
        </ul>
      );

    default:
      return null;
  }
}

export default ContentSection;

