import { COLORS } from '../constants/colors';

function PageHeader({ title, onBack, rightContent, className = '' }) {
  return (
    <div className={`bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg transition-all hover:bg-gray-100"
              style={{ color: COLORS.header.bg }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
            {title}
          </h2>
        </div>
        {rightContent && (
          <div className="flex items-center gap-2 sm:gap-3">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;

