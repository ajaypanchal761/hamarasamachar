import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

function ProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    
    // Load mobile number if available
    const savedMobile = localStorage.getItem('userMobileNumber');
    if (savedMobile) {
      setMobileNumber(savedMobile);
    }

    // Load selected categories from localStorage
    const savedCategories = localStorage.getItem('userCategories');
    if (savedCategories) {
      setSelectedCategories(JSON.parse(savedCategories));
    }
  }, []);

  const generateUserId = () => {
    // Generate or retrieve user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'PI' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('userId', userId);
    }
    return userId;
  };

  const topMenuItems = [
    { 
      id: 'city', 
      label: 'मेरा शहर', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      action: () => console.log('City clicked') 
    },
    { 
      id: 'topics', 
      label: 'पसंदीदा रुचि', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ), 
      action: () => navigate('/category-selection') 
    },
    { 
      id: 'about', 
      label: 'हमारे बारे में', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      action: () => navigate('/about') 
    },
    { 
      id: 'contact', 
      label: 'संपर्क करें', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      action: () => navigate('/contact') 
    },
    { 
      id: 'franchise', 
      label: 'राजस्थान हेड फ्रेंचाइजी', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ), 
      action: () => navigate('/franchise') 
    },
    { 
      id: 'saved', 
      label: 'बुकमार्क न्यूज़', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ), 
      action: () => navigate('/bookmarks') 
    },
    { 
      id: 'notifications', 
      label: 'नोटिफिकेशन सेटिंग्स', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      action: () => console.log('Notifications clicked') 
    },
    { 
      id: 'rate', 
      label: 'ऐप को रेटिंग दें', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ), 
      action: () => navigate('/rate-app') 
    },
    { 
      id: 'feedback', 
      label: 'फीडबैक', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ), 
      action: () => navigate('/feedback') 
    }
  ];

  const bottomMenuItems = [
    { 
      id: 'terms', 
      label: 'नियम और शर्तें', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      action: () => console.log('Terms clicked') 
    },
    { 
      id: 'delete', 
      label: 'खाता हटा दो', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9l-6 6m0-6l-6 6" />
        </svg>
      ), 
      action: () => {
        setShowDeleteConfirm(true);
      }, 
      isDestructive: true 
    },
    { 
      id: 'logout', 
      label: 'लॉग आउट', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ), 
      action: () => {
        setShowLogoutConfirm(true);
      },
      isDestructive: true 
    }
  ];

  const handleEdit = () => {
    navigate('/profile-setup');
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userMobileNumber');
    localStorage.removeItem('userCategories');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleDeleteConfirm = () => {
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userMobileNumber');
    localStorage.removeItem('userId');
    localStorage.removeItem('userCategories');
    setShowDeleteConfirm(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-bold text-gray-800">प्रोफाइल</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-2.5 sm:px-3 py-3 sm:py-4">
        {/* Profile Information Section */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex-1">
              <p className="text-sm sm:text-base font-medium text-gray-900">
                मोबाइल नंबर: {mobileNumber || 'नहीं सेट किया गया'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">User ID: {generateUserId()}</p>
              {profileData?.birthday && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">जन्मदिन: {new Date(profileData.birthday).toLocaleDateString('hi-IN')}</p>
              )}
              {profileData?.gender && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">
                  लिंग: {profileData.gender === 'male' ? 'मिस्टर' : profileData.gender === 'female' ? 'मिस' : 'अन्य'}
                </p>
              )}
              {selectedCategories.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs sm:text-sm text-gray-500 font-normal mb-1">पसंदीदा श्रेणियाँ:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.slice(0, 5).map((category) => (
                      <span key={category} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        {category}
                      </span>
                    ))}
                    {selectedCategories.length > 5 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        +{selectedCategories.length - 5} और
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleEdit}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
              aria-label="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Top Menu Items */}
        <div className="space-y-0 mb-4 sm:mb-5">
          {topMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className="w-full flex items-center justify-between px-2.5 sm:px-3 py-3 sm:py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-gray-900"
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="text-gray-700 flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm sm:text-base text-gray-900" style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Bottom Menu Items */}
        <div className="space-y-0">
          {bottomMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center justify-between px-2.5 sm:px-3 py-3 sm:py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                item.isDestructive ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className={`flex-shrink-0 ${item.isDestructive ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.icon}
                </div>
                <span className={`text-sm sm:text-base ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* App Version */}
        <div className="mt-4 sm:mt-5 text-center">
          <p className="text-xs text-gray-400">App Version v1.0.0</p>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-orange-600 rounded-lg shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              लॉग आउट
            </h3>
            <p className="text-sm sm:text-base text-white mb-4 sm:mb-5">
              क्या आप लॉग आउट करना चाहते हैं?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg border-2 border-white bg-transparent text-white font-medium hover:bg-white hover:text-orange-600 transition-colors text-sm sm:text-base"
              >
                रद्द करें
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg bg-white text-orange-600 font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                लॉग आउट
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-orange-600 rounded-lg shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              खाता हटाएं
            </h3>
            <p className="text-sm sm:text-base text-white mb-4 sm:mb-5">
              क्या आप अपना अकाउंट डिलीट करना चाहते हैं?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg border-2 border-white bg-transparent text-white font-medium hover:bg-white hover:text-orange-600 transition-colors text-sm sm:text-base"
              >
                रद्द करें
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg bg-white text-red-600 font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                हटाएं
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;

