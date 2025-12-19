import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../constants/categories';
import { updateProfile, getCurrentUser } from '../services/authService';

function CategorySelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.editMode || false;
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Load saved categories from backend or localStorage
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (token) {
          const user = await getCurrentUser();
          if (user) {
            // Check if profile is already complete (only redirect if NOT in edit mode)
            // When coming from profile page (editMode=true), don't redirect
            if (!isEditMode && user.gender && user.gender !== '' && user.selectedCategory) {
              // Profile already complete, redirect to home (only during first-time setup)
              navigate('/category/breaking');
              return;
            }
            
            // In edit mode, always allow user to see and edit categories

            // Load categories from backend - check selectedCategories array first, then fallback to selectedCategory
            if (user.selectedCategories && Array.isArray(user.selectedCategories) && user.selectedCategories.length > 0) {
              setSelectedCategories(user.selectedCategories);
              return;
            } else if (user.selectedCategory) {
              // Fallback to single selectedCategory for backward compatibility
              setSelectedCategories([user.selectedCategory]);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error loading categories from backend:', error);
      }

      // Fallback to localStorage
      const savedCategories = localStorage.getItem('userCategories');
      if (savedCategories) {
        setSelectedCategories(JSON.parse(savedCategories));
      }
    };

    loadCategories();

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isEditMode, navigate]);

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

  const handleContinue = async () => {
    setLoading(true);

    try {
      // Save selected categories to localStorage
      localStorage.setItem('userCategories', JSON.stringify(selectedCategories));

      // Save all selected categories to backend
      const categoriesToSave = selectedCategories.length > 0 ? selectedCategories : ['ब्रेकिंग'];
      const firstCategory = categoriesToSave[0];
      
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          await updateProfile({
            selectedCategories: categoriesToSave,
            selectedCategory: firstCategory // Keep for backward compatibility
          });
        } catch (apiError) {
          console.error('Backend update failed:', apiError);
          // Continue even if backend fails
        }
      }

      // Navigate based on mode
      if (isEditMode) {
        // In edit mode, go back to profile page after saving
        navigate('/profile');
      } else {
        // First-time setup, go to home
        navigate('/category/breaking');
      }
    } catch (error) {
      console.error('Save categories error:', error);
      // Still navigate even if save fails
      if (isEditMode) {
        navigate('/profile');
      } else {
        navigate('/category/breaking');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (isEditMode) {
      navigate('/profile');
    } else {
      navigate('/category/breaking');
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-white flex flex-col page-transition" style={{ height: '100dvh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-md flex-shrink-0" style={{ backgroundColor: '#E21E26' }}>
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
        <h2 className="text-sm sm:text-base font-semibold text-white text-center flex-1 px-2">
          अपने पसंदीदा विषय चुनें
        </h2>
        <button
          onClick={handleSkip}
          className="text-white text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
        >
          स्किप
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-4 sm:py-6">
        <div className="w-full max-w-2xl mx-auto">
          {/* Instruction */}
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 text-center leading-snug">
            अपने पसंदीदा विषयों को आगे रखें और उनके अधिक अपडेट प्राप्त करें
          </p>

          {/* Category Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-all duration-300 transform ${isSelected
                    ? 'bg-[#E21E26]/5 ring-1 ring-[#E21E26] shadow-sm scale-95'
                    : 'bg-white border border-gray-100 hover:border-[#E21E26]/30 hover:shadow-sm'
                    }`}
                  style={{ aspectRatio: '1/1' }}
                >
                  {/* Checkmark for selected */}
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 bg-[#E21E26] rounded-full p-0.5 shadow-sm">
                      <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Category Icon */}
                  <span className={`text-xl sm:text-2xl mb-1 transition-transform duration-300 ${isSelected ? 'scale-110' : 'grayscale opacity-80'}`}>
                    {categoryIcons[category] || '📰'}
                  </span>

                  {/* Category Label */}
                  <span className={`text-[9px] sm:text-[10px] font-semibold text-center leading-tight transition-colors line-clamp-1 ${isSelected ? 'text-[#E21E26]' : 'text-gray-500'
                    }`}>
                    {category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-bold text-base tracking-wide bg-gradient-to-r from-[#E21E26] to-[#C21A20] text-white hover:shadow-[#E21E26]/30 shadow-lg transform transition-all duration-200 active:scale-95 mb-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'सेव कर रहे हैं...' : 'आगे बढ़ें'}
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
    </div>
  );
}

export default CategorySelectionPage;

