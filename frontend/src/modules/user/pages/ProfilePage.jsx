import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { getCurrentUser, updateProfile, deleteAccount } from '../services/authService';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    breakingNews: true,
    localNews: true,
    sportsNews: true,
    entertainmentNews: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger visibility after component mounts for smooth transition
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Check authentication first
    const token = localStorage.getItem('userToken');
    if (!token) {
      // Redirect to login with message
      navigate('/login', { 
        state: { 
          message: 'प्रोफाइल देखने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: '/profile'
        } 
      });
      return;
    }

    // Load user data from backend first, then fallback to localStorage
    const loadUserData = async () => {
      setLoading(true);
      try {
        
        if (token) {
          // Try to load from backend
          const user = await getCurrentUser();
          if (user) {
            // Set mobile number from backend
            if (user.phone) {
              const formattedPhone = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
              setMobileNumber(formattedPhone);
            }

            // Set user ID from backend
            if (user.id) {
              // Use MongoDB ObjectId (24 chars) - take first 8 chars for display
              const userIdStr = user.id.toString();
              const shortId = userIdStr.length > 8 ? userIdStr.substring(0, 8).toUpperCase() : userIdStr.toUpperCase();
              setUserId(shortId);
            } else if (user._id) {
              // Fallback to _id if id is not present
              const userIdStr = user._id.toString();
              const shortId = userIdStr.length > 8 ? userIdStr.substring(0, 8).toUpperCase() : userIdStr.toUpperCase();
              setUserId(shortId);
            }

            // Set profile data from backend
            const backendProfileData = {
              birthday: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : null,
              gender: user.gender ? user.gender.toLowerCase() : null,
            };
            setProfileData(backendProfileData);

            // Set selected categories from backend - check selectedCategories array first
            if (user.selectedCategories && Array.isArray(user.selectedCategories) && user.selectedCategories.length > 0) {
              setSelectedCategories(user.selectedCategories);
              localStorage.setItem('userCategories', JSON.stringify(user.selectedCategories));
            } else if (user.selectedCategory) {
              // Fallback to single selectedCategory for backward compatibility
              setSelectedCategories([user.selectedCategory]);
              localStorage.setItem('userCategories', JSON.stringify([user.selectedCategory]));
            }

            // Set notification settings from backend
            if (user.notificationSettings) {
              setNotificationSettings({
                pushNotifications: user.notificationSettings.pushNotifications ?? true,
                breakingNews: user.notificationSettings.breakingNews ?? true,
                localNews: user.notificationSettings.localNews ?? true,
                sportsNews: user.notificationSettings.sportsNews ?? true,
                entertainmentNews: user.notificationSettings.entertainmentNews ?? true
              });
            }

            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading user data from backend:', error);
      }

      // Fallback to localStorage - get from userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          
          // Load profile data from userData
          if (user.birthdate || user.gender) {
            const profileData = {
              birthday: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : null,
              gender: user.gender ? user.gender.toLowerCase() : null,
            };
            setProfileData(profileData);
          }
          
          // Load mobile number from userData
          if (user.phone) {
            const formattedPhone = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`;
            setMobileNumber(formattedPhone);
          }
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }

      // Load selected categories from localStorage
      const savedCategories = localStorage.getItem('userCategories');
      if (savedCategories) {
        setSelectedCategories(JSON.parse(savedCategories));
      }
      
      setLoading(false);
    };

    loadUserData();
  }, []);

  const getDisplayUserId = () => {
    // Get user ID from state
    if (userId) {
      return userId;
    }
    
    // Try to get from userData
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.id) {
          // MongoDB ObjectId is 24 chars, take first 8 for display
          const userIdStr = user.id.toString();
          const shortId = userIdStr.length > 8 ? userIdStr.substring(0, 8).toUpperCase() : userIdStr.toUpperCase();
          setUserId(shortId);
          return shortId;
        } else if (user._id) {
          const userIdStr = user._id.toString();
          const shortId = userIdStr.length > 8 ? userIdStr.substring(0, 8).toUpperCase() : userIdStr.toUpperCase();
          setUserId(shortId);
          return shortId;
        }
      } catch (e) {
        console.error('Error parsing userData:', e);
      }
    }
    
    // Generate new ID as last resort (only if no backend data available)
    const newUserId = 'PI' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setUserId(newUserId);
    return newUserId;
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
      action: () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login', { 
            state: { 
              message: 'शहर चुनने के लिए कृपया लॉगिन करें या साइन अप करें',
              redirectTo: '/city-selection'
            } 
          });
          return;
        }
        navigate('/city-selection');
      }
    },
    {
      id: 'topics',
      label: 'पसंदीदा रुचि',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      action: () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login', { 
            state: { 
              message: 'पसंदीदा रुचि देखने के लिए कृपया लॉगिन करें या साइन अप करें',
              redirectTo: '/category-selection'
            } 
          });
          return;
        }
        navigate('/category-selection', { state: { editMode: true } });
      }
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
      action: () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
          navigate('/login', { 
            state: { 
              message: 'बुकमार्क न्यूज़ देखने के लिए कृपया लॉगिन करें या साइन अप करें',
              redirectTo: '/bookmarks'
            } 
          });
          return;
        }
        navigate('/bookmarks');
      }
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
      action: () => setShowNotificationSettings(true)
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
      action: () => navigate('/terms-and-conditions')
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
    // Navigate to profile setup in edit mode
    navigate('/profile-setup', { state: { editMode: true } });
  };

  const handleLogoutConfirm = () => {
    // Clear all user data
    localStorage.removeItem('userCategories');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('userToken');

      if (token) {
        // Call backend API to delete account
        await deleteAccount();
      } else {
        // If no token, just clear local data
        localStorage.removeItem('userCategories');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }

      setShowDeleteConfirm(false);
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.message || 'खाता हटाने में समस्या हुई। कृपया पुनः प्रयास करें।');
      setShowDeleteConfirm(false);
    }
  };

  const handleNotificationToggle = async (settingKey) => {
    const newSettings = {
      ...notificationSettings,
      [settingKey]: !notificationSettings[settingKey]
    };
    setNotificationSettings(newSettings);

    try {
      await updateProfile({ notificationSettings: newSettings });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      // Revert on error
      setNotificationSettings(notificationSettings);
      alert('नोटिफिकेशन सेटिंग्स सेव करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className={`min-h-screen bg-white fade-in ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div className="page-transition pb-20 sm:pb-24">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200" style={{ backgroundColor: '#E21E26' }}>
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
          <h2 className="text-sm sm:text-base font-bold text-white">प्रोफाइल</h2>
          <div className="w-6 sm:w-8"></div>
        </div>

        {/* Main Content */}
        <div className="px-2.5 sm:px-3 py-3 sm:py-4">
          {/* Profile Information Section */}
          <div className="mb-4 sm:mb-5">
            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-tight">
                        {loading ? 'Loading...' : (mobileNumber || 'Guest User')}
                      </p>
                      <p className="text-xs text-gray-400 font-medium tracking-wide">ID: {getDisplayUserId()}</p>
                    </div>
                  </div>

                  <div className="space-y-1 mt-3 pl-1">
                    {profileData?.birthday && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>🎂</span>
                        <span>{new Date(profileData.birthday).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                    {profileData?.gender && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>⚧</span>
                        <span>{profileData.gender === 'male' ? 'पुरुष' : profileData.gender === 'female' ? 'महिला' : 'अन्य'}</span>
                      </div>
                    )}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">पसंदीदा विषय</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.slice(0, 5).map((category) => (
                          <span key={category} className="text-xs font-medium px-2.5 py-1 bg-[#E21E26]/5 text-[#E21E26] border border-[#E21E26]/10 rounded-lg">
                            {category}
                          </span>
                        ))}
                        {selectedCategories.length > 5 && (
                          <span className="text-xs font-medium px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-100 rounded-lg">
                            +{selectedCategories.length - 5} और
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-400 hover:text-[#E21E26] hover:bg-[#E21E26]/5 rounded-xl transition-all"
                  aria-label="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Menu Sections Container */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-5">
            {/* Top Menu Items */}
            <div className="divide-y divide-gray-50">
              {topMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-gray-500 group-hover:text-[#E21E26] transition-colors p-1.5 bg-gray-50 group-hover:bg-[#E21E26]/5 rounded-lg">
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Menu Items */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-50">
              {bottomMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors group`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${item.isDestructive
                      ? 'bg-red-50 text-red-500 group-hover:bg-red-100'
                      : 'bg-gray-50 text-gray-500 group-hover:bg-[#E21E26]/5 group-hover:text-[#E21E26]'
                      }`}>
                      {item.icon}
                    </div>
                    <span className={`text-sm font-semibold ${item.isDestructive ? 'text-red-600' : 'text-gray-700 group-hover:text-gray-900'
                      }`}>{item.label}</span>
                  </div>
                  {!item.isDestructive && (
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* App Version */}
          <div className="mt-4 sm:mt-5 text-center">
            <p className="text-xs text-gray-400">App Version v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-[#E21E26] rounded-lg shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              लॉग आउट
            </h3>
            <p className="text-sm sm:text-base text-white mb-4 sm:mb-5">
              क्या आप लॉग आउट करना चाहते हैं?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg border-2 border-white bg-transparent text-white font-medium hover:bg-white hover:text-[#E21E26] transition-colors text-sm sm:text-base"
              >
                रद्द करें
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg bg-white text-[#E21E26] font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
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
          <div className="bg-[#E21E26] rounded-lg shadow-2xl max-w-xs sm:max-w-sm w-full p-4 sm:p-5">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
              खाता हटाएं
            </h3>
            <p className="text-sm sm:text-base text-white mb-4 sm:mb-5">
              क्या आप अपना अकाउंट डिलीट करना चाहते हैं?
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 rounded-lg border-2 border-white bg-transparent text-white font-medium hover:bg-white hover:text-[#E21E26] transition-colors text-sm sm:text-base"
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

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-4 sm:p-5 transform transition-all scale-100 animate-slide-up">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                नोटिफिकेशन सेटिंग्स
              </h3>
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* Push Notifications */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">पुश नोटिफिकेशन</h4>
                  <p className="text-xs sm:text-sm text-gray-500">ब्राउज़र में नोटिफिकेशन प्राप्त करें</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={() => handleNotificationToggle('pushNotifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E21E26]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21E26]"></div>
                </label>
              </div>

              {/* Breaking News */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">ब्रेकिंग न्यूज़</h4>
                  <p className="text-xs sm:text-sm text-gray-500">महत्वपूर्ण समाचार के लिए नोटिफिकेशन</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.breakingNews}
                    onChange={() => handleNotificationToggle('breakingNews')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E21E26]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21E26]"></div>
                </label>
              </div>

              {/* Local News */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">स्थानीय समाचार</h4>
                  <p className="text-xs sm:text-sm text-gray-500">आपके शहर के समाचार</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.localNews}
                    onChange={() => handleNotificationToggle('localNews')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E21E26]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21E26]"></div>
                </label>
              </div>

              {/* Sports News */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">खेल समाचार</h4>
                  <p className="text-xs sm:text-sm text-gray-500">खेल से संबंधित अपडेट</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.sportsNews}
                    onChange={() => handleNotificationToggle('sportsNews')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E21E26]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21E26]"></div>
                </label>
              </div>

              {/* Entertainment News */}
              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900">मनोरंजन समाचार</h4>
                  <p className="text-xs sm:text-sm text-gray-500">फिल्म, टीवी और मनोरंजन अपडेट</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.entertainmentNews}
                    onChange={() => handleNotificationToggle('entertainmentNews')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#E21E26]/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E21E26]"></div>
                </label>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="w-full py-3 px-4 bg-[#E21E26] text-white font-semibold rounded-xl hover:bg-[#c21a20] transition-colors"
              >
                ठीक है
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
