import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updateProfile, getCurrentUser } from '../services/authService';

function ProfileSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.editMode || false;
  const [birthday, setBirthday] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    // Load existing profile data if available
    useEffect(() => {
      // Prevent body scroll on mount
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';

      // Try to load from backend first, then fallback to localStorage
      const loadProfileData = async () => {
        try {
          const token = localStorage.getItem('userToken');
          if (token) {
            const user = await getCurrentUser();
            if (user) {
              // Check if profile is already complete (only redirect if NOT in edit mode)
              if (!isEditMode && user.gender && user.gender !== '' && user.selectedCategory) {
                // Profile already complete, redirect to home (only during first-time setup)
                navigate('/category/breaking');
                return;
              }

              // Load from backend (works for both first-time and edit mode)
              if (user.birthdate) {
                const date = new Date(user.birthdate);
                if (!isNaN(date.getTime())) {
                  setBirthday(date.toISOString().split('T')[0]);
                }
              }
              if (user.gender) {
                // Map backend gender (Male/Female/Other) to frontend (male/female/other)
                const genderMap = {
                  'Male': 'male',
                  'Female': 'female',
                  'Other': 'other'
                };
                setSelectedGender(genderMap[user.gender] || user.gender.toLowerCase());
              }
              return;
            }
          }
        } catch (error) {
          console.error('Error loading profile from backend:', error);
        }

        // Fallback to localStorage - get from userData
        const userData = localStorage.getItem('userData');
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.birthdate) {
              const date = new Date(user.birthdate);
              if (!isNaN(date.getTime())) {
                setBirthday(date.toISOString().split('T')[0]);
              }
            }
            if (user.gender) {
              const genderMap = {
                'Male': 'male',
                'Female': 'female',
                'Other': 'other'
              };
              setSelectedGender(genderMap[user.gender] || user.gender.toLowerCase());
            }
          } catch (e) {
            console.error('Error parsing userData:', e);
          }
        }
      };

      loadProfileData();

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const handleSave = async () => {
    if (!selectedGender) {
      alert('कृपया लिंग चुनें (अनिवार्य)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Map frontend gender (male/female/other) to backend format (Male/Female/Other)
      const genderMap = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other'
      };

      const profileData = {
        gender: genderMap[selectedGender] || selectedGender,
      };

      // Add birthdate if provided
      if (birthday) {
        profileData.birthdate = birthday;
      }

      // Try to update profile on backend
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          await updateProfile(profileData);
        } catch (apiError) {
          console.error('Backend update failed:', apiError);
          // Continue to save to localStorage as fallback
        }
      }

      // Profile data is already saved in userData via updateProfile API call

      // Navigate to category selection (pass edit mode if we're editing)
      if (isEditMode) {
        navigate('/category-selection', { state: { editMode: true } });
      } else {
        navigate('/category-selection');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      setError(error.message || 'प्रोफाइल सेव करने में समस्या हुई');
      
      // Profile data will be saved in userData when backend succeeds
      if (isEditMode) {
        navigate('/category-selection', { state: { editMode: true } });
      } else {
        navigate('/category-selection');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/category-selection');
  };

  const genders = [
    {
      id: 'male',
      label: 'मिस्टर',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5" />
          <path d="m21 3-6.75 6.75" />
          <circle cx="10" cy="14" r="5" />
        </svg>
      )
    },
    {
      id: 'female',
      label: 'मिस',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 15v7" />
          <path d="M9 19h6" />
        </svg>
      )
    },
    {
      id: 'other',
      label: 'अन्य',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-white flex flex-col page-transition" style={{ height: '100dvh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-md flex-shrink-0" style={{ backgroundColor: '#E21E26' }}>
        <button
          onClick={() => navigate(-1)}
          className="text-white p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-white">मेरा प्रोफाइल</h2>
        <button
          onClick={handleSkip}
          className="text-white text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
        >
          स्किप
        </button>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 overflow-hidden">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Instruction */}
          <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-5 text-center leading-snug">
            अपनी प्रोफाइल डिटेल दीजिए ताकि हम आपकी पसंद की ज्यादा खबरें दिखा सकें
          </p>

          {/* Birthday Input */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              आपका जन्मदिन (वैकल्पिक)
            </label>
            <div className="relative group">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#E21E26] focus:ring-4 focus:ring-[#E21E26]/10 transition-all outline-none bg-gray-50 hover:bg-white"
                style={{ fontSize: '16px' }}
                max={new Date().toISOString().split('T')[0]}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-[#E21E26] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </span>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              लिंग <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-4 sm:gap-6">
              {genders.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => setSelectedGender(gender.id)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-300 w-24 h-28 sm:w-28 sm:h-32 ${selectedGender === gender.id
                    ? 'bg-[#E21E26]/5 border-2 border-[#E21E26] shadow-md transform -translate-y-1'
                    : 'bg-white border border-gray-100 hover:border-[#E21E26]/30 hover:shadow-sm'
                    }`}
                >
                  {selectedGender === gender.id && (
                    <div className="absolute top-2 right-2 text-[#E21E26]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <span className={`text-3xl mb-2 transition-transform duration-300 ${selectedGender === gender.id ? 'scale-110 text-[#E21E26]' : 'text-gray-400 grayscale'}`}>
                    {gender.icon}
                  </span>
                  <span className={`text-xs sm:text-sm font-semibold transition-colors ${selectedGender === gender.id ? 'text-[#E21E26]' : 'text-gray-500'}`}>
                    {gender.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-xs text-center">{error}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedGender || loading}
            className={`w-full py-2.5 rounded-xl font-bold text-base tracking-wide shadow-lg transform transition-all duration-200 active:scale-95 ${selectedGender && !loading
              ? 'bg-gradient-to-r from-[#E21E26] to-[#C21A20] text-white hover:shadow-[#E21E26]/30 hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              }`}
          >
            {loading ? 'सेव कर रहे हैं...' : 'आगे बढ़ें'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetupPage;

