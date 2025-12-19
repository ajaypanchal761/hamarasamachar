import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRating, getMyRating } from '../services/ratingService';


function RateAppPage() {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing rating from backend
    const loadRating = async () => {
      try {
        const rating = await getMyRating();
        if (rating) {
          setSelectedRating(rating.rating);
          if (rating.comment) {
            setFeedback(rating.comment);
          }
        }
      } catch (error) {
        console.error('Error loading rating:', error);
      }
    };

    loadRating();
  }, []);

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      alert('कृपया रेटिंग चुनें');
      return;
    }

    setLoading(true);

    try {
      // Submit to backend
      await submitRating(selectedRating, feedback.trim());

      // Also save to localStorage as backup
      const ratingData = {
        rating: selectedRating,
        feedback: feedback.trim(),
        date: new Date().toISOString()
      };

      const existingRatings = JSON.parse(localStorage.getItem('appRatings') || '[]');
      existingRatings.push(ratingData);
      localStorage.setItem('appRatings', JSON.stringify(existingRatings));

      setSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message || 'रेटिंग सबमिट करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pb-20 sm:pb-24">
        <div className="text-center px-4">
          <div className="mb-3">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">धन्यवाद!</h2>
          <p className="text-sm text-gray-600">आपकी रेटिंग सबमिट हो गई है</p>
        </div>

      </div>
    );
  }

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
          <h2 className="text-sm sm:text-base font-bold text-white">ऐप को रेटिंग दें</h2>
          <div className="w-6 sm:w-8"></div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4">
          <div className="max-w-xl mx-auto">
            {/* App Info */}
            <div className="text-center mb-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">हमारा समाचार</h1>
              <p className="text-sm text-gray-600">आपको हमारा ऐप कैसा लगा?</p>
            </div>

            {/* Rating Stars */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                रेटिंग चुनें
              </label>
              <div className="flex justify-center gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`transition-transform hover:scale-110 ${selectedRating >= rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                      }`}
                    aria-label={`${rating} stars`}
                  >
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  आपने {selectedRating} स्टार दिया
                </p>
              )}
            </div>

            {/* Feedback Section */}
            <div className="mb-4">
              <label
                htmlFor="feedback"
                className="block text-xs font-medium text-gray-700 mb-1.5"
              >
                फीडबैक (वैकल्पिक)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26] resize-none"
                placeholder="अपना फीडबैक यहाँ लिखें..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={selectedRating === 0 || loading}
              className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-colors ${selectedRating === 0 || loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#E21E26] hover:bg-[#C21A20]'
                }`}
            >
              {loading ? 'सबमिट कर रहे हैं...' : 'सबमिट करें'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}

    </div>
  );
}

export default RateAppPage;
