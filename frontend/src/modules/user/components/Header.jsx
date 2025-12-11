import logo from '../assets/samachar-logo.png';

function Header() {
  const handleSearchClick = () => {
    // TODO: Implement search
    console.log('Search clicked');
  };

  const handleBellClick = () => {
    // TODO: Implement notifications
    console.log('Bell clicked');
  };

  return (
    <header 
      className="sticky top-0 z-10 w-full rounded-t-2xl overflow-hidden"
      style={{ backgroundColor: '#E21E26' }}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-5 py-2 sm:py-2.5">
        {/* Left Logo Container */}
        <div className="flex-shrink-0 h-12 sm:h-14 md:h-16 lg:h-20 w-28 sm:w-36 md:w-44 lg:w-52 overflow-visible flex items-center">
          <img 
            src={logo} 
            alt="हमारा समाचार Logo" 
            className="h-full w-auto object-contain"
            style={{ transform: 'scale(1.6)', transformOrigin: 'left center' }}
          />
        </div>

        {/* Right Icons - Search and Bell */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Search Icon */}
          <button
            onClick={handleSearchClick}
            className="text-white hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Search"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 sm:h-7 sm:w-7" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Bell Icon */}
          <button
            onClick={handleBellClick}
            className="text-white hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Notifications"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 sm:h-7 sm:w-7" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

