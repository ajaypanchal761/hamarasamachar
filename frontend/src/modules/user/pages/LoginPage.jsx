import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendOTP } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Toast from '../components/Toast';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast, hideToast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const redirectMessage = location.state?.message || null;
  const redirectTo = location.state?.redirectTo || null;

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';

    // Fix viewport height to prevent shift when keyboard opens
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  const handleContinue = async () => {
    if (mobileNumber.length !== 10) {
      showToast('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें', 'error');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const fullPhoneNumber = countryCode + mobileNumber;
      const response = await sendOTP(fullPhoneNumber, 'registration');
      
      if (response.success) {
        // Navigate to OTP page (mobile number will be saved in userData after OTP verification)
        navigate('/otp', { 
          state: { 
            mobileNumber: fullPhoneNumber,
            redirectTo: redirectTo,
            redirectMessage: redirectMessage
          } 
        });
      } else {
        setError(response.message || 'OTP भेजने में समस्या हुई');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError(error.message || 'OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
      showToast(error.message || 'OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/category/breaking');
  };

  const handleInputFocus = (e) => {
    // Prevent page scroll when input is focused
    e.preventDefault();
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 100);
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden bg-white flex flex-col page-transition" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
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
        <h2 className="text-sm sm:text-base font-semibold text-white">लॉगिन</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* App Name */}
          <div className="text-center mb-2 sm:mb-3">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              हमारा समाचार
            </h1>
          </div>

          {/* Login Prompt */}
          <div className="mb-2 sm:mb-3">
            <p className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-snug">
              {redirectMessage || 'कृपया लॉगिन करने के लिए अपना मोबाइल नंबर जोड़ें'}
            </p>
            {redirectMessage && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 text-center leading-snug">
                  {redirectMessage}
                </p>
              </div>
            )}
          </div>

          {/* Mobile Number Input */}
          <div className="mb-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#E21E26] focus-within:ring-4 focus-within:ring-[#E21E26]/10 transition-all bg-gray-50 hover:bg-white shadow-sm">
              <div className="flex items-center gap-1.5 px-2 py-2 border-r border-gray-200 bg-gray-100/50">
                <span className="text-lg">🇮🇳</span>
                <span className="font-bold text-gray-700 text-xs">{countryCode}</span>
                <span className="text-gray-400 text-[9px]">▼</span>
              </div>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 10) {
                    setMobileNumber(value);
                  }
                }}
                onFocus={handleInputFocus}
                placeholder="मोबाइल नंबर डालें"
                className="flex-1 px-3 py-2.5 outline-none bg-transparent font-medium text-gray-900 placeholder-gray-400 h-full"
                style={{ fontSize: '16px' }}
                maxLength={10}
              />
            </div>
          </div>

          {/* Privacy Message */}
          <div className="flex items-start gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-green-600 text-base sm:text-lg flex-shrink-0 mt-0.5">🔒</span>
            <p className="text-xs sm:text-sm text-gray-600 leading-snug">
              आपकी पर्सनल जानकारी सुरक्षित है। आपका नंबर सिर्फ अकाउंट वेरीफाई करने के लिए ले रहे हैं।
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs text-center">{error}</p>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={mobileNumber.length !== 10 || loading}
            className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-md transform transition-all duration-200 active:scale-95 mb-3 ${mobileNumber.length === 10 && !loading
              ? 'bg-gradient-to-r from-[#E21E26] to-[#C21A20] text-white hover:shadow-[#E21E26]/30 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
          >
            {loading ? 'भेज रहे हैं...' : 'आगे बढ़ें'}
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

    {/* Toast Notification */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    )}
    </>
  );
}

export default LoginPage;

