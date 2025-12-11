import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

function RateAppPage() {
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    if (selectedRating === 0) {
      alert('कृपया रेटिंग चुनें');
      return;
    }
    
    // Save rating to localStorage
    const ratingData = {
      rating: selectedRating,
      feedback: feedback,
      date: new Date().toISOString()
    };
    
    const existingRatings = JSON.parse(localStorage.getItem('appRatings') || '[]');
    existingRatings.push(ratingData);
    localStorage.setItem('appRatings', JSON.stringify(existingRatings));
    
    setSubmitted(true);
    setTimeout(() => {
      navigate(-1);
    }, 2000);
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
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-bold text-gray-800">ऐप को रेटिंग दें</h2>
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
                  className={`transition-transform hover:scale-110 ${
                    selectedRating >= rating
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
              className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="अपना फीडबैक यहाँ लिखें..."
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0}
            className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-colors ${
              selectedRating === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            सबमिट करें
          </button>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default RateAppPage;

