import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  // Determine active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/profile' || path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path === '/shorts' || path.startsWith('/shorts')) {
      setActiveTab('shorts');
    } else if (path === '/category/breaking' || path.startsWith('/category/')) {
      setActiveTab('home');
    } else if (path === '/epaper') {
      setActiveTab('epaper');
    }
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      navigate('/category/breaking');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'shorts') {
      navigate('/shorts');
    } else if (tab === 'epaper') {
      navigate('/epaper');
    }
  };

  const navItems = [
    {
      id: 'home',
      label: 'होम',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'shorts',
      label: 'शॉर्ट्स',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'epaper',
      label: 'ई-पेपर',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'प्रोफ़ाइल',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-1 sm:py-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item.id)}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 sm:px-4 py-1 transition-colors ${activeTab === item.id
              ? 'text-[#E21E26]'
              : 'text-gray-600 hover:text-gray-900'
              }`}
            aria-label={item.label}
          >
            <div className={`${activeTab === item.id ? 'text-[#E21E26]' : 'text-gray-600'}`}>
              {item.icon}
            </div>
            <span className={`text-xs sm:text-sm ${activeTab === item.id ? 'font-bold' : 'font-normal'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default BottomNavbar;

