import { useNavigate } from 'react-router-dom';
import { COLORS } from '../constants/colors';

function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-3 sm:px-4 animate-fade-in">
      <div className="text-center max-w-md w-full">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FEE2E2' }}
        >
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
            style={{ color: COLORS.header.bg }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">पहुंच अस्वीकृत</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-7 md:mb-8 px-2">
          आपके पास इस पेज तक पहुंचने की अनुमति नहीं है। यदि आपको लगता है कि यह एक त्रुटि है, तो कृपया अपने व्यवस्थापक से संपर्क करें।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base text-white transition-all"
            style={{ backgroundColor: COLORS.header.bg }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = COLORS.button.primary.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = COLORS.header.bg;
            }}
          >
            डैशबोर्ड पर जाएं
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base border-2 transition-all"
            style={{
              borderColor: COLORS.header.bg,
              color: COLORS.header.bg,
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            वापस जाएं
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;

