import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import logo from '../assets/samachar-logo.png';
import Header from './Header';

function Layout({ children, title, showSidebar = true }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && sidebarOpen && !e.target.closest('.sidebar-container')) {
        setSidebarOpen(false);
      }
    };
    
    if (sidebarOpen && isMobile) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!showSidebar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          title={title} 
          onBack={() => window.history.back()}
          compact={true}
        />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`sidebar-container ${
          sidebarOpen ? 'w-64' : 'w-0 md:w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col fixed md:relative z-20`}
        style={{
          height: '100vh',
          minHeight: '100vh',
          top: 0,
          left: 0
        }}
      >
        {/* Logo */}
        <div 
          className="border-b flex-shrink-0 overflow-hidden" 
          style={{ 
            height: '60px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: COLORS.header.bg,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0',
            paddingLeft: '12px'
          }}
        >
          <img 
            src={logo} 
            alt="हमारा समाचार Logo" 
            className="object-contain"
            style={{ 
              display: 'block',
              filter: 'brightness(0) invert(1)',
              margin: '0',
              width: sidebarOpen ? '280px' : '85px',
              height: '70px'
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto" style={{ minHeight: 0 }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all"
            style={{ 
              backgroundColor: location.pathname === '/admin/dashboard' ? `${COLORS.header.bg}40` : 'transparent',
              color: location.pathname === '/admin/dashboard' ? COLORS.header.bg : '#374151'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/admin/dashboard') {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/admin/dashboard') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {sidebarOpen && <span>डैशबोर्ड</span>}
          </button>
          <button
            onClick={() => navigate('/admin/news')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all"
            style={{ 
              backgroundColor: location.pathname.startsWith('/admin/news') ? `${COLORS.header.bg}40` : 'transparent',
              color: location.pathname.startsWith('/admin/news') ? COLORS.header.bg : '#374151'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/news')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/news')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            {sidebarOpen && <span>समाचार</span>}
          </button>
          <button
            onClick={() => navigate('/admin/categories')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all"
            style={{ 
              backgroundColor: location.pathname.startsWith('/admin/categories') ? `${COLORS.header.bg}40` : 'transparent',
              color: location.pathname.startsWith('/admin/categories') ? COLORS.header.bg : '#374151'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/categories')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/categories')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {sidebarOpen && <span>श्रेणियाँ</span>}
          </button>
          <button
            onClick={() => navigate('/admin/profile')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all"
            style={{ 
              backgroundColor: location.pathname === '/admin/profile' ? `${COLORS.header.bg}40` : 'transparent',
              color: location.pathname === '/admin/profile' ? COLORS.header.bg : '#374151'
            }}
            onMouseEnter={(e) => {
              if (location.pathname !== '/admin/profile') {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/admin/profile') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {sidebarOpen && <span>प्रोफ़ाइल</span>}
          </button>
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium text-base text-gray-700 hover:bg-gray-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <Header 
          title={title || 'एडमिन डैशबोर्ड'}
          rightContent={
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center gap-2 md:gap-3">
                <div 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: COLORS.header.text
                  }}
                >
                  {admin?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs md:text-sm font-medium" style={{ color: COLORS.header.text }}>
                    {admin?.name || 'Admin'}
                  </p>
                  <p className="text-xs opacity-80 hidden md:block" style={{ color: COLORS.header.text }}>
                    {admin?.role?.replace('_', ' ') || 'Admin'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm md:text-base transition-all"
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
                <span className="hidden sm:inline">लॉगआउट</span>
                <svg className="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          }
          compact={true}
        />

        {/* Content */}
        {children}
      </div>
    </div>
  );
}

export default Layout;

