import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';

function CategorySelectionPage() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Load saved categories from localStorage
    const savedCategories = localStorage.getItem('userCategories');
    if (savedCategories) {
      setSelectedCategories(JSON.parse(savedCategories));
    }

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // Category icons mapping
  const categoryIcons = {
    'ब्रेकिंग': '🔥',
    'नेशनल': '🏛️',
    'राजस्थान': '🏜️',
    'संपादकीय': '✍️',
    'इंटरव्यू': '🎤',
    'चुनाव': '🗳️',
    'क्राइम': '🚨',
    'राजनीति': '🏛️',
    'प्रशासनिक': '📋',
    'सांस्कृतिक': '🎭',
    'धार्मिक': '🕉️',
    'सामाजिक': '👥',
    'खेलकूद': '⚽',
    'शिक्षा': '📚',
    'संगठन': '🏢',
    'मनोरंजन': '🎬',
    'फ़िल्मी दुनिया': '🎞️',
    'समाचार बुलेटिन': '📺',
    'स्पेशल बुलेटिन': '📢',
    'स्पेशल बाइट': '💡',
    'लाइफस्टाइल': '✨',
    'बिज़नेस': '💼',
    'टेक्नोलॉजी': '💻'
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleContinue = () => {
    // Save selected categories to localStorage
    localStorage.setItem('userCategories', JSON.stringify(selectedCategories));
    navigate('/category/breaking');
  };

  const handleSkip = () => {
    navigate('/category/breaking');
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-white flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-800 text-center flex-1 px-2">
          अपने पसंदीदा विषय चुनें
        </h2>
        <button
          onClick={handleSkip}
          className="text-orange-600 text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
        >
          स्किप
        </button>
      </div>

      {/* Main Content */}
      <div className="px-2.5 sm:px-3 py-3 sm:py-4">
        {/* Instruction */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center leading-snug">
          अपने पसंदीदा विषयों को आगे रखें और उनके अधिक अपडेट प्राप्त करें
        </p>

        {/* Category Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-2.5 md:p-3 rounded-full transition-all ${
                  isSelected
                    ? 'bg-orange-100 ring-2 ring-orange-600'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Checkmark for selected */}
                {isSelected && (
                  <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 bg-orange-600 rounded-full p-0.5 sm:p-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                {/* Category Icon */}
                <span className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-1.5">{categoryIcons[category] || '📰'}</span>
                
                {/* Category Label */}
                <span className="text-[10px] sm:text-xs font-medium text-gray-700 text-center leading-tight px-0.5">
                  {category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 transition-all shadow-sm mb-2 sm:mb-2.5"
        >
          आगे बढ़ें
        </button>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="w-full py-1.5 sm:py-2 text-gray-600 text-xs sm:text-sm hover:text-gray-800 transition-colors"
        >
          स्किप करें
        </button>
      </div>
    </div>
  );
}

export default CategorySelectionPage;

