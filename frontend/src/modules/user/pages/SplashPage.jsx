import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/samachar-logo.png';

function SplashPage() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Show content after a brief delay
    setTimeout(() => {
      setShowContent(true);
    }, 300);

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white" style={{ height: '100dvh' }}>
      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center justify-center w-full px-4 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        {/* Logo Container - Rounded with Orange Background */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full flex items-center justify-center mb-8 shadow-lg p-4" style={{ backgroundColor: '#E21E26' }}>
          <img
            src={logo}
            alt="हमारा समाचार Logo"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Tagline */}
        <p className="text-gray-800 text-lg sm:text-xl text-center px-4 mb-8">
          Get All The Latest News On Your Phone
        </p>

        {/* Continue Button */}
        <button
          onClick={() => navigate('/login')}
          className="px-8 py-2.5 rounded-lg font-semibold text-lg hover:opacity-90 transition-colors shadow-lg text-white" style={{ backgroundColor: '#E21E26' }}
        >
          आगे बढ़ें
        </button>
      </div>
    </div>
  );
}

export default SplashPage;

