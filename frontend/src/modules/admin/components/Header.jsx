import { COLORS } from '../constants/colors';

function Header({ title, onBack, rightContent, compact = false, onMenuToggle }) {
  return (
    <div 
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: COLORS.header.bg }}
    >
      <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 ${compact ? 'py-1.5 sm:py-2 md:py-2.5' : 'py-2 sm:py-3 md:py-4'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="md:hidden p-2 rounded-lg transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: COLORS.header.text
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg transition-all"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: COLORS.header.text
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className={`${compact ? 'text-base sm:text-lg md:text-xl' : 'text-lg sm:text-xl md:text-2xl'} font-bold`} style={{ color: COLORS.header.text }}>
              {title}
            </h1>
          </div>
          {rightContent && (
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;

