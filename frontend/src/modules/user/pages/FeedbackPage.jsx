import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitFeedback, getMyFeedbacks } from '../services/feedbackService';


function FeedbackPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null); // 'app' or 'news'
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showViewFeedback, setShowViewFeedback] = useState(false);
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  useEffect(() => {
    // Load all feedbacks from backend first, then fallback to localStorage
    const loadFeedbacks = async () => {
      try {
        const backendFeedbacks = await getMyFeedbacks();
        if (backendFeedbacks && backendFeedbacks.length > 0) {
          // Transform backend format to frontend format
          const transformedFeedbacks = backendFeedbacks.map(fb => ({
            type: fb.type === 'App Feedback' ? 'app' : 'news',
            feedback: fb.text,
            date: fb.createdAt || fb.date
          }));
          setAllFeedbacks(transformedFeedbacks);
          // Also save to localStorage as backup
          localStorage.setItem('userFeedbacks', JSON.stringify(transformedFeedbacks));
        } else {
          // Fallback to localStorage
          const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
          setAllFeedbacks(feedbacks);
        }
      } catch (error) {
        console.error('Error loading feedbacks:', error);
        // Fallback to localStorage
        const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
        setAllFeedbacks(feedbacks);
      }
    };

    loadFeedbacks();
  }, [submitted]);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType) {
      alert('कृपया फीडबैक का प्रकार चुनें');
      return;
    }
    if (!feedback.trim()) {
      alert('कृपया फीडबैक लिखें');
      return;
    }

    try {
      // Submit to backend
      await submitFeedback(selectedType, feedback.trim());

      // Also save to localStorage as backup
      const feedbackData = {
        type: selectedType,
        feedback: feedback.trim(),
        date: new Date().toISOString()
      };

      const existingFeedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
      existingFeedbacks.push(feedbackData);
      localStorage.setItem('userFeedbacks', JSON.stringify(existingFeedbacks));

      setSubmitted(true);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(error.message || 'फीडबैक सबमिट करने में समस्या हुई। कृपया पुनः प्रयास करें।');
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
          <p className="text-sm text-gray-600">आपका फीडबैक सबमिट हो गया है</p>
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
          <h2 className="text-sm sm:text-base font-bold text-white">फीडबैक</h2>
          <div className="w-6 sm:w-8"></div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4">
          <div className="max-w-xl mx-auto">
            {/* View Feedbacks Button */}
            {!selectedType && !showViewFeedback && (
              <div className="mb-4">
                <button
                  onClick={() => setShowViewFeedback(true)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">मेरे फीडबैक देखें</span>
                    {allFeedbacks.length > 0 && (
                      <span className="text-xs bg-[#E21E26]/10 text-[#E21E26] px-2 py-0.5 rounded-full">
                        {allFeedbacks.length}
                      </span>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* View Feedbacks Section */}
            {showViewFeedback && !selectedType ? (
              <div>
                <button
                  onClick={() => setShowViewFeedback(false)}
                  className="flex items-center gap-2 text-gray-600 mb-4 text-sm hover:text-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  वापस
                </button>

                <h3 className="text-base font-semibold text-gray-900 mb-3">मेरे फीडबैक</h3>

                {allFeedbacks.length > 0 ? (
                  <div className="space-y-3">
                    {allFeedbacks.slice().reverse().map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs px-2 py-1 bg-[#E21E26]/10 text-[#E21E26] rounded-full font-medium">
                            {item.type === 'app' ? 'ऐप फीडबैक' : 'न्यूज़ फीडबैक'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('hi-IN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800">{item.feedback}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">कोई फीडबैक नहीं मिला</p>
                  </div>
                )}
              </div>
            ) : !selectedType ? (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 text-center">
                  फीडबैक का प्रकार चुनें
                </h3>
                <div className="space-y-3">
                  {/* App Feedback Option */}
                  <button
                    onClick={() => handleTypeSelect('app')}
                    className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#E21E26] hover:bg-[#E21E26]/5 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E21E26]/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#E21E26]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">ऐप फीडबैक</h4>
                      <p className="text-xs text-gray-500">ऐप के बारे में अपना फीडबैक दें</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* News Feedback Option */}
                  <button
                    onClick={() => handleTypeSelect('news')}
                    className="w-full flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:border-[#E21E26] hover:bg-[#E21E26]/5 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-[#E21E26]/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#E21E26]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">न्यूज़ फीडबैक</h4>
                      <p className="text-xs text-gray-500">समाचार के बारे में अपना फीडबैक दें</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Back to Type Selection */}
                <button
                  onClick={() => setSelectedType(null)}
                  className="flex items-center gap-2 text-gray-600 mb-4 text-sm hover:text-gray-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  वापस
                </button>

                {/* Feedback Form */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {selectedType === 'app' ? 'ऐप फीडबैक' : 'न्यूज़ फीडबैक'}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {selectedType === 'app'
                      ? 'हमारे ऐप के बारे में अपना फीडबैक साझा करें'
                      : 'समाचार के बारे में अपना फीडबैक साझा करें'}
                  </p>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="feedback"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    फीडबैक
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-2.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26] resize-none"
                    placeholder={selectedType === 'app'
                      ? 'अपना ऐप फीडबैक यहाँ लिखें...'
                      : 'अपना न्यूज़ फीडबैक यहाँ लिखें...'}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!feedback.trim()}
                  className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-colors ${!feedback.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#E21E26] hover:bg-[#C21A20]'
                    }`}
                >
                  सबमिट करें
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}

    </div>
  );
}

export default FeedbackPage;
