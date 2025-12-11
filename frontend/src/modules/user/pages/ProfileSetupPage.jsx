import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileSetupPage() {
  const navigate = useNavigate();
  const [birthday, setBirthday] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  // Load existing profile data if available
  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setBirthday(profileData.birthday || '');
      setSelectedGender(profileData.gender || '');
    }

    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  const handleSave = () => {
    if (!selectedGender) {
      alert('कृपया लिंग चुनें (अनिवार्य)');
      return;
    }
    // Save profile data to localStorage
    const profileData = {
      birthday: birthday,
      gender: selectedGender,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    navigate('/category-selection');
  };

  const handleSkip = () => {
    navigate('/category-selection');
  };

  const genders = [
    { id: 'male', label: 'मिस्टर', icon: '👨' },
    { id: 'female', label: 'मिस', icon: '👩' },
    { id: 'other', label: 'अन्य', icon: '🧑' }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-white flex flex-col" style={{ height: '100dvh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-semibold text-gray-800">मेरा प्रोफाइल</h2>
        <button
          onClick={handleSkip}
          className="text-orange-600 text-xs sm:text-sm font-medium hover:opacity-80 transition-opacity"
        >
          स्किप
        </button>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-2.5 sm:px-3 py-3 sm:py-4 overflow-hidden">
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
            <div className="relative">
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-orange-600 outline-none"
                style={{ fontSize: '16px' }}
                max={new Date().toISOString().split('T')[0]}
              />
              <span className="absolute right-2.5 sm:right-3 top-1/2 transform -translate-y-1/2 text-lg sm:text-xl">
                🎂
              </span>
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-4 sm:mb-5">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
              लिंग <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
              {genders.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => setSelectedGender(gender.id)}
                  className={`flex flex-col items-center gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-full transition-all ${
                    selectedGender === gender.id
                      ? 'bg-orange-100 ring-2 ring-orange-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl">{gender.icon}</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {gender.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!selectedGender}
            className={`w-full py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all shadow-sm ${
              selectedGender
                ? 'bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            सेव
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetupPage;

