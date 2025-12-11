import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

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

  const handleContinue = () => {
    if (mobileNumber.length === 10) {
      navigate('/otp', { state: { mobileNumber: countryCode + mobileNumber } });
    } else {
      alert('कृपया 10 अंकों का मोबाइल नंबर दर्ज करें');
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
    <div className="fixed inset-0 overflow-hidden bg-white flex flex-col" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">लॉगिन</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-2.5 sm:px-3 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* App Name */}
          <div className="text-center mb-2 sm:mb-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              हमारा समाचार
            </h1>
          </div>

          {/* Login Prompt */}
          <div className="mb-2 sm:mb-3">
            <p className="text-sm sm:text-base font-semibold text-gray-900 text-center leading-snug">
              कृपया लॉगिन करने के लिए अपना मोबाइल नंबर जोड़ें
            </p>
          </div>

          {/* Mobile Number Input */}
          <div className="mb-2 sm:mb-2.5">
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden focus-within:border-orange-600 transition-colors">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 bg-gray-50 border-r-2 border-gray-300">
                <span className="text-base sm:text-lg">🇮🇳</span>
                <span className="font-semibold text-gray-700 text-xs sm:text-sm">{countryCode}</span>
                <span className="text-gray-500 text-xs">▼</span>
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
                className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 outline-none bg-white"
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

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={mobileNumber.length !== 10}
            className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base mb-1.5 sm:mb-2 transition-all shadow-sm ${
              mobileNumber.length === 10
                ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
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
    </div>
  );
}

export default LoginPage;

