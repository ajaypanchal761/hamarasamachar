import { useNavigate } from 'react-router-dom';


function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24 page-transition">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200" style={{ backgroundColor: '#E21E26' }}>
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
        <h2 className="text-sm sm:text-base font-bold text-white">हमारे बारे में</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Company Name */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E21E26] mb-3 sm:mb-4">
              हमारा समाचार
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              राजस्थान की प्रतिष्ठित हिंदी न्यूज़ मीडिया हाउस
            </p>
          </div>

          {/* About Section */}
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">हमारे बारे में</h2>
            <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                हमारा समाचार राजस्थान की राजधानी जयपुर में एक प्रतिष्ठित हिंदी न्यूज़ मीडिया हाउस है।
                हमारा समाचार मीडिया समूह में दैनिक प्रातःकालीन समाचार पत्र के साथ वेब न्यूज चैनल,
                वेबसाइट है जो नेशनल, पॉलिटिक्स, राजस्थान, क्राइम, स्पोर्ट्स, एंटरटेनमेंट, लाइफस्टाइल,
                बिज़नेस, टेक्नोलॉजी और कई अन्य कैटेगरी में लेटेस्ट खबरें कवर करती है। सोशल मीडिया हो या
                समाचार पत्र के लाखों पाठक वर्ग इसकी अपनी तरह की अलग खबरों के कारण राज्यभर में पसंद करते हैं।
              </p>
            </div>
          </div>

          {/* Office Address Section */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">कार्यालय पता</h2>
            <div className="text-sm sm:text-base text-gray-700 space-y-2">
              <p className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#E21E26] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>हमारे दैनिक समाचार पत्र, "हमारा समाचार" का सिटी कार्यालय 42 कॉस्मो कॉलोनी, विनायक रेजिडेंसी, वैशाली नगर जयपुर में है।</span>
              </p>
            </div>
          </div>

          {/* Registration Section */}
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">पंजीकरण एवं मान्यता</h2>
            <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                हमारा दैनिक प्रातः कालीन समाचार पत्र "हमारा समाचार" जो की दिल्ली RNI विभाग से दैनिक समाचार पत्र
                प्रकाशित होने के लिए रजिस्टर्ड है व हमारा दैनिक समाचार पत्र राजस्थान सरकार से सरकारी
                विज्ञापन के लिए मान्यता प्राप्त है।
              </p>
              <p>
                हमारा दैनिक प्रातः कालीन समाचार पत्र "हमारा समाचार" भी दिल्ली से RNI विभाग से रजिस्टर्ड
                एक दैनिक प्रातः कालीन समाचार पत्र है जो कि जयपुर से प्रकाशित होता है ओर संपूर्ण राजस्थान
                में प्रसारित होता है एवं राजस्थान के कुछ जिलों में अब प्रसारित होना है वह प्रयास जारी है।
              </p>
            </div>
          </div>

          {/* Training and Employment Section */}
          <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">प्रशिक्षण एवं रोजगार</h2>
            <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                दूसरी ओर हमारे समाचार पत्र का उद्देश्य काफी पढ़े लिखे उम्मीदवारों को मीडिया का प्रशिक्षण देकर उनको
                हमारे ही समाचार पत्र में रोजगार देना कार्य है।
              </p>
              <p>
                "हमारा समाचार" समाचार पत्र में हम कई तरह से पढ़े लिखे युवक युवतियों को रोजगार देने का
                प्रयास कर रहे है जिसमें रिपोर्टर, ऐंकर, मार्केटिंग एजेंट, टीम लीडर, कैमरा मेन, फोटो ग्राफर,
                न्यूज रीडर, प्रशिक्षण प्रशिक्षक ऐसे कई पद है जिनके लिए उम्मीदवारों को प्रशिक्षण देकर उनको
                हमारे ही प्रिंट व डिजिटल एडिशन में जॉब दी जाती है।
              </p>
            </div>
          </div>

          {/* App and Digital Edition Section */}
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ऐप एवं डिजिटल एडिशन</h2>
            <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                हमारे समाचार पत्र "हमारा समाचार" का App भी है जो कि डिजिटल एडिशन के रूप में कार्य करता है
                जो कि पब्लिक की किसी भी खबर को तुरंत व प्रमाणित तरीके से दिखाने का कार्य करता है।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}

    </div>
  );
}

export default AboutPage;

