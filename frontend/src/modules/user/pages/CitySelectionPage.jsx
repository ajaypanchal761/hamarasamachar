import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../services/authService';


const RAJASTHAN_DISTRICTS = [
    { name: "Ajmer", hindi: "अजमेर" },
    { name: "Alwar", hindi: "अलवर" },
    { name: "Balotra", hindi: "बालोतरा" },
    { name: "Banswara", hindi: "बांसवाड़ा" },
    { name: "Baran", hindi: "बारां" },
    { name: "Barmer", hindi: "बाड़मेर" },
    { name: "Beawar", hindi: "ब्यावर" },
    { name: "Bharatpur", hindi: "भरतपुर" },
    { name: "Bhilwara", hindi: "भीलवाड़ा" },
    { name: "Bikaner", hindi: "बीकानेर" },
    { name: "Bundi", hindi: "बूंदी" },
    { name: "Chittorgarh", hindi: "चित्तौड़गढ़" },
    { name: "Churu", hindi: "चूरू" },
    { name: "Dausa", hindi: "दौसा" },
    { name: "Deeg", hindi: "डीग" },
    { name: "Dholpur", hindi: "धौलपुर" },
    { name: "Didwana-Kuchaman", hindi: "डीडवाना-कुचामन" },
    { name: "Dudu", hindi: "दूदू" },
    { name: "Dungarpur", hindi: "डूंगरपुर" },
    { name: "Gangapur City", hindi: "गंगापुर सिटी" },
    { name: "Hanumangarh", hindi: "हनुमानगढ़" },
    { name: "Jaipur", hindi: "जयपुर" },
    { name: "Jaipur Rural", hindi: "जयपुर ग्रामीण" },
    { name: "Jaisalmer", hindi: "जैसलमेर" },
    { name: "Jalore", hindi: "जालोर" },
    { name: "Jhalawar", hindi: "झालावाड़" },
    { name: "Jhunjhunu", hindi: "झुंझुनू" },
    { name: "Jodhpur", hindi: "जोधपुर" },
    { name: "Jodhpur Rural", hindi: "जोधपुर ग्रामीण" },
    { name: "Karauli", hindi: "करौली" },
    { name: "Kekri", hindi: "केकड़ी" },
    { name: "Khairthal-Tijara", hindi: "खैरथल-तिजारा" },
    { name: "Kota", hindi: "कोटा" },
    { name: "Kotputli-Behror", hindi: "कोटपुतली-बहरोड़" },
    { name: "Nagaur", hindi: "नागौर" },
    { name: "Neem Ka Thana", hindi: "नीम का थाना" },
    { name: "Pali", hindi: "पाली" },
    { name: "Phalodi", hindi: "फलोदी" },
    { name: "Pratapgarh", hindi: "प्रतापगढ़" },
    { name: "Rajsamand", hindi: "राजसमंद" },
    { name: "Salumbar", hindi: "सलूम्बर" },
    { name: "Sanchore", hindi: "सांचोर" },
    { name: "Sawai Madhopur", hindi: "सवाई माधोपुर" },
    { name: "Shahpura", hindi: "शाहपुरा" },
    { name: "Sikar", hindi: "सीकर" },
    { name: "Sirohi", hindi: "सिरोही" },
    { name: "Sri Ganganagar", hindi: "श्री गंगानगर" },
    { name: "Tonk", hindi: "टोंक" },
    { name: "Udaipur", hindi: "उदयपुर" }
];

function CitySelectionPage() {
    const navigate = useNavigate();
    const [selectedCity, setSelectedCity] = useState(null); // object {name, hindi}
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Load from backend first, then fallback to localStorage
        const loadCity = async () => {
            try {
                const token = localStorage.getItem('userToken');
                if (token) {
                    const { getCurrentUser } = await import('../services/authService');
                    const user = await getCurrentUser();
                    if (user && user.selectedCity) {
                        const found = RAJASTHAN_DISTRICTS.find(d => d.name === user.selectedCity || d.hindi === user.selectedCity);
                        if (found) {
                            setSelectedCity(found);
                            localStorage.setItem('userCity', found.name);
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading city from backend:', error);
            }

            // Fallback to localStorage
            const savedCityName = localStorage.getItem('userCity');
            if (savedCityName) {
                const found = RAJASTHAN_DISTRICTS.find(d => d.name === savedCityName || d.hindi === savedCityName);
                if (found) setSelectedCity(found);
                else setSelectedCity({ name: savedCityName, hindi: savedCityName });
            }
        };

        loadCity();
    }, []);

    const handleCitySelect = async (cityObj) => {
        setSelectedCity(cityObj);
        // Save to localStorage
        localStorage.setItem('userCity', cityObj.name);
        
        // Save to backend
        const token = localStorage.getItem('userToken');
        if (token) {
            try {
                await updateProfile({
                    selectedCity: cityObj.name,
                    selectedDistrict: cityObj.name // Using same value for both for now
                });
            } catch (error) {
                console.error('Error saving city to backend:', error);
                // Continue even if backend fails
            }
        }
        
        navigate(-1);
    };

    const filteredDistricts = RAJASTHAN_DISTRICTS.filter(district =>
        district.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.hindi.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="page-transition pb-20 sm:pb-24">
                {/* Header - Fixed to top */}
                <div className="sticky top-0 z-30 border-b border-gray-200" style={{ backgroundColor: '#E21E26' }}>
                    <div className="flex items-center justify-between px-3" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
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
                        <h2 className="text-sm sm:text-base md:text-lg font-bold text-white">अपना जिला चुनें</h2>
                        <div className="w-6 sm:w-8"></div>
                    </div>

                    {/* Search Bar Container */}
                    <div className="px-4 pt-3 pb-3 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="जिला खोजें..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E21E26]"
                            />
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="px-4 py-4">
                    {selectedCity && !searchTerm && (
                        <div className="mb-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">वर्तमान चयन</h3>
                            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                                <span className="font-medium text-[#E21E26]">{selectedCity.hindi || selectedCity.name}</span>
                                <svg className="w-5 h-5 text-[#E21E26]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">राजस्थान के जिले</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {filteredDistricts.length > 0 ? (
                            filteredDistricts.map((district) => (
                                <button
                                    key={district.name}
                                    onClick={() => handleCitySelect(district)}
                                    className={`text-left px-4 py-3 rounded-lg border transition-all flex justify-between items-center ${selectedCity?.name === district.name
                                        ? 'bg-[#E21E26] text-white border-[#E21E26]'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50'
                                        }`}
                                >
                                    <span>{district.hindi}</span>
                                    {selectedCity?.name === district.name && (
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="col-span-1 text-center py-8 text-gray-500">
                                कोई जिला नहीं मिला
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Navbar */}

        </div>
    );
}

export default CitySelectionPage;
