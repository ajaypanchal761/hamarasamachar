import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber || '+916264560457';
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, canResend]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, ''); // Only numbers
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, index) => {
      if (index < 4) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);
    if (pastedData.length === 4 && inputRefs.current[3]) {
      inputRefs.current[3].focus();
    }
  };

  const handleConfirm = () => {
    const otpString = otp.join('');
    if (otpString.length === 4) {
      // TODO: Verify OTP with backend
      // Save mobile number to localStorage
      if (mobileNumber) {
        localStorage.setItem('userMobileNumber', mobileNumber);
      }
      navigate('/profile-setup');
    } else {
      alert('कृपया 4 अंकों का OTP दर्ज करें');
    }
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '']);
    // TODO: Resend OTP
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleChangeNumber = () => {
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-white flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">OTP वेरीफिकेशन</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-2.5 sm:px-3 py-3 sm:py-4 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Instruction */}
          <p className="text-center text-sm sm:text-base text-gray-900 mb-4 sm:mb-5 leading-snug">
            {mobileNumber} पर भेजे गये 4 अंकों का कोड दर्ज करें
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-5">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center font-semibold border-b-2 border-gray-300 focus:border-orange-600 outline-none transition-colors"
                style={{ fontSize: '16px' }}
              />
            ))}
          </div>

          {/* Action Links */}
          <div className="flex justify-between mb-4 sm:mb-5">
            <button
              onClick={handleChangeNumber}
              className="text-orange-600 text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
            >
              नंबर बदलना है?
            </button>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className={`text-xs sm:text-sm font-medium transition-opacity ${
                canResend ? 'text-orange-600 hover:opacity-80' : 'text-gray-400'
              }`}
            >
              OTP दोबारा भेजें {!canResend && `(${formatTime(timer)})`}
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={otp.join('').length !== 4}
            className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base mb-2 sm:mb-2.5 transition-all shadow-sm ${
              otp.join('').length === 4
                ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            पुष्टि करें
          </button>

          {/* Skip Button */}
          <button
            onClick={() => navigate('/profile-setup')}
            className="w-full py-1.5 sm:py-2 text-gray-600 text-xs sm:text-sm hover:text-gray-800 transition-colors"
          >
            स्किप करें
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPPage;

