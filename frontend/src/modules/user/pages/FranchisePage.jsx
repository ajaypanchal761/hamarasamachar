import { useNavigate } from 'react-router-dom';

function FranchisePage() {
  const navigate = useNavigate();

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:hamarasamachar62@gmail.com';
  };

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
        <h2 className="text-sm sm:text-base font-bold text-white">राजस्थान हेड फ्रेंचाइजी</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E21E26] mb-3 sm:mb-4">
              राजस्थान हेड फ्रेंचाइजी
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Rajasthan Head Franchise
            </p>
          </div>

          {/* Main Franchise Information */}
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
            <div className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed space-y-3">
              <p>
                "हमारा समाचार" दैनिक समाचार पत्र की ओर से दिनांक 03/12/2025 से सम्पूर्ण राजस्थान स्टेट के लिए
                स्टेट फ्रेंचाइजी अधिकृत किया है जिसमें प्रबंधक ही सभी कार्य संभालेगा। "हमारा समाचार" की ओर से स्टेट
                फ्रेंचाइजी अधिकृत इसलिए किया गया है जिससे कि संपूर्ण राजस्थान में सभी जिलों व तहसील में
                "हमारा समाचार" समाचार पत्र के लिए प्रत्येक जिले में फ्रेंचाइजी दी जाएगी, जिसमें की एक
                सिक्योरिटी राशि होगी, जिस भी व्यक्ति को "हमारा समाचार" समाचार पत्र में जिले की फ्रेंचाइजी
                लेनी होगी वह एक तय सिक्योरिटी राशि मैनेजर को देकर जिले की फ्रेंचाइजी ले सकते है।
              </p>
              <p>
                इसी प्रकार जिले के फ्रेंचाइजी होल्डर को ये अधिकृत किया जाएगा कि वह अपने जिले की संपूर्ण
                तहसीलों में भी फ्रेंचाइजी दे सकेंगे, जिसमें की उनका भी कमीशन व जो भी तहसील वाले कार्य करेंगे
                उनमें से भी जिला फ्रेंचाइजी को भी प्रत्येक महीने आय मिलती रहेगी।
              </p>
              <p>
                स्टेट फ्रेंचाइजी की ओर से सभी जिला व तहसील फ्रेंचाइजी को कई प्रकार की योजनाओं में शामिल किया
                जाएगा व भविष्य में जिला व तहसील फ्रेंचाइजी के द्वारा एक टारगेट पूरा कर लेने पर स्टेट फ्रेंचाइजी
                की ओर से कई प्रकार की सुविधा भी दी जाएगी! जो निम्न प्रकार से है!
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">सुविधाएं एवं योजनाएं</h2>
            <div className="space-y-4 sm:space-y-5">
              {/* Benefit 1 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  1. कार्यालय खर्च एवं स्टाफ सैलरी
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी लेने वाले 3 माह के अंदर अपने जिले की सभी तहसीलों में फ्रेंचाइजी दे देते है व
                  जिले का राजस्व टारगेट प्रत्येक माह का 1 करोड़ देने लग जाते है तब जिला फ्रेंचाइजी के कार्यालय
                  का आधा खर्चा, स्टाफ में 2 स्टाफ की सैलरी में 10000/रुपए देना शुरू कर दिया जाएगा।
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  2. एग्रीमेंट
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी लेने वाले व्यक्ति के साथ स्टेट फ्रेंचाइजी 500/रुपए के स्टांप पर एक एग्रीमेंट
                  साइन करेगी जिसमें सभी प्रकार की शर्ते व सुविधाएं लिखी होंगी।
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  3. तहसील से कमीशन
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी के द्वारा अपनी सभी तहसीलों में फ्रेंचाइजी देने के बाद तहसील द्वारा जितना
                  बिजनेस दिया जाएगा उसका कुछ परसेंट जिला फ्रेंचाइजी को भी प्रत्येक महीने दिया जाएगा।
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  4. शपथ पत्र
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी से एक शपथ पत्र भी लिया जाएगा, जिसमें उनसे लिखवाया जाएगा कि फ्रेंचाइजी देने
                  वाले दिन से जिला फ्रेंचाइजी के द्वारा किसी भी प्रकार की असमाजिक, असंवैधानिक, या इलीगल
                  मामला पाया जाता है तब जिला फ्रेंचाइजी स्वत ही निरस्त मानी जाएगी।
                </p>
              </div>

              {/* Benefit 5 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  5. नियंत्रण एवं निरीक्षण
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी के द्वारा जितनी भी तहसील फ्रेंचाइजी है उन सभी पर जिला फ्रेंचाइजी का ही
                  नियंत्रण रहेगा, लेकिन स्टेट फ्रेंचाइजी कभी भी ओचक निरीक्षण कर सकती है।
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  6. योजनाओं में शामिल
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला व तहसील फ्रेंचाइजी को स्टेट फ्रेंचाइजी के द्वारा कई प्रकार की योजनाओं में शामिल किया
                  जाएगा।
                </p>
              </div>

              {/* Benefit 7 */}
              <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 border-l-4 border-[#E21E26]">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  7. प्रिंट ऑथराइजेशन
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जब जिला फ्रेंचाइजी के द्वारा अपनी संपूर्ण तहसीलों में फ्रेंचाइजी दे दी जाती है तब जिले में
                  (10000) के लगभग समाचार पत्र की प्रतियां पब्लिक में वितरित होने लग जाए तब स्टेट फ्रेंचाइजी
                  के द्वारा उस जिले में ही समाचार पत्र की प्रिंट के लिए ऑथराइज कर दिया जाएगा।
                </p>
              </div>
            </div>
          </div>

          {/* Manager Section */}
          <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">मैनेजर</h2>
            <div className="text-sm sm:text-base text-gray-700 mb-4">
              <p className="text-gray-600">राजस्थान हेड फ्रेंचाइजी मैनेजर</p>
            </div>
            {/* Franchise Application Button */}
            <button
              onClick={() => navigate('/franchise/apply')}
              className="w-full sm:w-auto bg-[#E21E26] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#c91b22] transition-colors flex items-center justify-center gap-2 mb-3"
            >
              <span>फ्रेंचाइजी लेने के लिए</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Journalist Training Section */}
          <div className="bg-[#F4C20D]/10 border border-[#F4C20D]/30 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">जर्नलिस्ट प्रशिक्षण केंद्र</h2>
            <div className="text-sm sm:text-base text-gray-700 mb-4 space-y-2">
              <p>
                दैनिक समाचार पत्र "हमारा समाचार" के द्वारा डिजिटल एडिशन व प्रिंट एडिशन में जर्नलिस्ट प्रशिक्षण सेंटर का संचालन जयपुर में किया जा रहा है ताकि किसी भी संकाय के विद्यार्थी मीडिया क्षेत्र में अपना करियर बना सके।
              </p>
              <p className="font-medium">
                राजस्थान के 12 पास विद्यार्थी जर्नलिस्ट प्रशिक्षण ले सकते हैं।
              </p>
            </div>
            {/* Journalist Training Button */}
            <button
              onClick={() => navigate('/journalist-training')}
              className="w-full sm:w-auto bg-[#F4C20D] text-black font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#E0B00C] transition-colors flex items-center justify-center gap-2"
            >
              <span>प्रशिक्षण के लिए आवेदन करें</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Contact Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5">संपर्क करें</h2>

            {/* Email */}
            <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">ईमेल</h3>
              <button
                onClick={handleEmailClick}
                className="flex items-center gap-2 text-[#E21E26] hover:text-[#C21A20] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-base sm:text-lg font-medium">hamarasamachar62@gmail.com</span>
              </button>
            </div>

            {/* Franchise Contact */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                Rajasthan head frenchise
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">
                Mobile number
              </p>
              <button
                onClick={() => handlePhoneClick('8824839740')}
                className="flex items-center gap-2 text-[#E21E26] hover:text-[#C21A20] transition-colors text-base sm:text-lg font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>8824839740</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}

    </div>
  );
}

export default FranchisePage;

