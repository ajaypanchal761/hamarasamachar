import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../services/authService';

function OTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const mobileNumber = location.state?.mobileNumber || '+916264560457';

  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
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
    setError(''); // Clear error on input

    // Auto focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto verify when 6 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.length === 6) {
      const otpString = newOtp.join('');
      handleConfirm(otpString);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);
    if (pastedData.length === 6 && inputRefs.current[5]) {
      inputRefs.current[5].focus();
      // Auto verify
      handleConfirm(pastedData);
    } else if (pastedData.length > 0 && inputRefs.current[Math.min(pastedData.length - 1, 5)]) {
      inputRefs.current[Math.min(pastedData.length - 1, 5)].focus();
    }
  };

  const handleConfirm = async (otpValue = null) => {
    const otpString = otpValue || otp.join('');
    
    if (otpString.length !== 6) {
      setError('कृपया 6 अंकों का OTP दर्ज करें');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await verifyOTP(mobileNumber, otpString, 'registration');
      
      if (response.success) {
        // Save token if received
        if (response.token) {
          localStorage.setItem('userToken', response.token);
        }
        // Save user data (contains phone/mobile number)
        if (response.user) {
          localStorage.setItem('userData', JSON.stringify(response.user));
        }
        
        // Check if profile is complete
        // If profile is complete, go to home page
        // If profile is incomplete, go to profile setup
        if (response.isProfileComplete) {
          // Profile already complete, go to home
          navigate('/category/breaking');
        } else {
          // Profile incomplete, go to profile setup
          navigate('/profile-setup');
        }
      } else {
        setError(response.message || 'OTP गलत है। कृपया पुनः प्रयास करें।');
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setError(error.message || 'OTP वेरीफाई करने में समस्या हुई। कृपया पुनः प्रयास करें।');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');
    setOtp(['', '', '', '', '', '']);

    try {
      const response = await sendOTP(mobileNumber, 'registration');
      
      if (response.success) {
        setTimer(60);
        setCanResend(false);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setError(response.message || 'OTP भेजने में समस्या हुई');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 overflow-hidden bg-white flex flex-col page-transition" style={{ height: '100dvh' }}>
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
        <h2 className="text-sm sm:text-base font-semibold text-white">OTP वेरीफिकेशन</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Instruction */}
          <p className="text-center text-sm sm:text-base text-gray-900 mb-4 sm:mb-5 leading-snug">
            {mobileNumber} पर भेजे गये 6 अंकों का कोड दर्ज करें
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs text-center">{error}</p>
            </div>
          )}

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-5 sm:mb-6">
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
                disabled={verifying}
                className={`w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 rounded-xl outline-none transition-all shadow-sm ${digit
                  ? 'border-[#E21E26] bg-[#E21E26]/5 text-[#E21E26]'
                  : 'border-gray-200 bg-white focus:border-[#E21E26] focus:ring-4 focus:ring-[#E21E26]/10'
                  } ${verifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
            ))}
          </div>

          {/* Action Links */}
          <div className="flex justify-between mb-4 sm:mb-5">
            <button
              onClick={handleChangeNumber}
              className="text-[#E21E26] text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
            >
              नंबर बदलना है?
            </button>
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`text-xs sm:text-sm font-medium transition-opacity ${canResend && !loading ? 'text-[#E21E26] hover:opacity-80' : 'text-gray-400'
                }`}
            >
              {loading ? 'भेज रहे हैं...' : `OTP दोबारा भेजें ${!canResend ? `(${formatTime(timer)})` : ''}`}
            </button>
          </div>

          {/* Confirm Button */}
          <button
            onClick={() => handleConfirm()}
            disabled={otp.join('').length !== 6 || verifying}
            className={`w-full py-2.5 rounded-xl font-bold text-sm tracking-wide shadow-md transform transition-all duration-200 active:scale-95 mb-3 ${otp.join('').length === 6 && !verifying
              ? 'bg-gradient-to-r from-[#E21E26] to-[#C21A20] text-white hover:shadow-[#E21E26]/30 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
          >
            {verifying ? 'वेरीफाई कर रहे हैं...' : 'पुष्टि करें'}
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

