import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import logo from '../assets/samachar-logo.png';
import Header from './Header';
import PageHeader from './PageHeader';

function Layout({ children, title, showSidebar = true, showPageHeader = true, pageHeaderRightContent }) {
  const auth = useAuth();
  const admin = auth?.admin || null;
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check if mobile and handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen) {
        // Optional: decide if we want to auto-close on resize to mobile
        // setSidebarOpen(false); 
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
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
    <div className="min-h-screen bg-gray-50 flex relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-[90] backdrop-blur-[2px] transition-all"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container ${sidebarOpen ? 'w-64 translate-x-0' : (isMobile ? '-translate-x-full w-64' : 'w-20 translate-x-0')
          } bg-white shadow-xl transition-all duration-300 flex flex-col fixed md:relative z-[100] h-full`}
        style={{
          height: '100vh',
          top: 0,
          left: 0
        }}
      >
        {/* Logo and Close Button */}
        <div
          className="border-b flex-shrink-0 overflow-hidden relative"
          style={{
            height: '60px', // Reverted height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.header.bg,
            // borderColor: 'rgba(255, 255, 255, 0.2)',
            padding: '0',
            // paddingLeft: sidebarOpen ? '0' : '0'
          }}
        >
          <img
            src={logo}
            alt="हमारा समाचार Logo"
            className="object-contain transition-all duration-300"
            style={{
              filter: 'brightness(0) invert(1)',
              width: sidebarOpen ? '240px' : '50px',
              height: '50px', // Fits within 60px header
              transform: 'scale(1.35)', // Zoom effect
            }}
          />

          {/* Mobile Close Button */}
          {isMobile && sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 md:p-3 space-y-1 md:space-y-2 overflow-y-auto" style={{ minHeight: 0 }}>
          <Link
            to="/admin/dashboard"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname === '/admin/dashboard' ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname === '/admin/dashboard' ? COLORS.header.bg : '#4B5563'
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
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>डैशबोर्ड</span>
          </Link>
          <Link
            to="/admin/news"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/news') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/news') ? COLORS.header.bg : '#4B5563'
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
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>समाचार प्रबंधन</span>
          </Link>
          <Link
            to="/admin/categories"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/categories') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/categories') ? COLORS.header.bg : '#4B5563'
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
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>श्रेणियाँ</span>
          </Link>
          <Link
            to="/admin/banners"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/banners') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/banners') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/banners')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/banners')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>बैनर</span>
          </Link>
          <Link
            to="/admin/plans"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/plans') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/plans') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/plans')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/plans')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h10a2 2 0 012 2v8a2 2 0 01-2 2H9m0-12H7a2 2 0 00-2 2v10a2 2 0 002 2h2m0-12v12" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>सब्सक्रिप्शन</span>
          </Link>
          <Link
            to="/admin/feedback"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/feedback') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/feedback') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/feedback')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/feedback')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>फीडबैक</span>
          </Link>
          <Link
            to="/admin/service-information"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/service-information') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/service-information') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/service-information')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/service-information')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>सेवा सूचना</span>
          </Link>
          <Link
            to="/admin/franchise-leads"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/franchise-leads') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/franchise-leads') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/franchise-leads')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/franchise-leads')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm6 8a6 6 0 00-12 0h12zM6 14a4 4 0 110-8 4 4 0 010 8zm6 6a6 6 0 00-6-6H0a6 6 0 006 6h6z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>फ्रेंचाइजी लीड्स</span>
          </Link>
          <Link
            to="/admin/training-leads"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/training-leads') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/training-leads') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/training-leads')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/training-leads')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>प्रशिक्षण लीड्स</span>
          </Link>
          <Link
            to="/admin/ratings"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/ratings') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/ratings') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/ratings')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/ratings')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>रेटिंग</span>
          </Link>
          <Link
            to="/admin/users"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/users') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/users') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/users')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/users')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>उपयोगकर्ता</span>
          </Link>
          <Link
            to="/admin/epaper"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname.startsWith('/admin/epaper') ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname.startsWith('/admin/epaper') ? COLORS.header.bg : '#4B5563'
            }}
            onMouseEnter={(e) => {
              if (!location.pathname.startsWith('/admin/epaper')) {
                e.target.style.backgroundColor = '#F3F4F6';
              }
            }}
            onMouseLeave={(e) => {
              if (!location.pathname.startsWith('/admin/epaper')) {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>ई-पेपर</span>
          </Link>
          <Link
            to="/admin/profile"
            onClick={handleNavClick}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all whitespace-nowrap overflow-hidden"
            style={{
              backgroundColor: location.pathname === '/admin/profile' ? `${COLORS.header.bg}15` : 'transparent',
              color: location.pathname === '/admin/profile' ? COLORS.header.bg : '#4B5563'
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
            <span className={`transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>प्रोफ़ाइल</span>
          </Link>
        </nav>

        {/* Toggle Sidebar */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0 hidden md:block">
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
      <div className="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300" style={{ maxHeight: '100vh' }}>
        {/* Header - Sticky */}
        <div className="flex-none z-10 sticky top-0">
          <Header
            title="एडमिन डैशबोर्ड"
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            rightContent={
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
            }
            compact={true}
          />

          {/* Page Header - Sticky under main Header */}
          {showPageHeader && title && (
            <div className="bg-gray-50 border-b border-gray-200">
              <PageHeader
                title={title}
                onBack={title !== 'एडमिन डैशबोर्ड' ? () => window.history.back() : null}
                rightContent={pageHeaderRightContent}
              />
            </div>
          )}
        </div>

        {/* Content - Scrollable */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50" style={{ minHeight: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

