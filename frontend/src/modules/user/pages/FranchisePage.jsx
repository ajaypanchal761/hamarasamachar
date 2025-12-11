import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';

function FranchisePage() {
  const navigate = useNavigate();

  const contactInfo = [
    {
      name: 'रामनिवास मंडोलिया',
      designation: 'मुख्य संपादक',
      phone: '9461162346',
      englishName: 'Ramniwas Mandoliya',
      englishDesignation: 'Chief Editor'
    },
    {
      name: 'मुजफ्फर अली',
      designation: 'सहायक संपादक',
      phone: '9461845696',
      englishName: 'Muzaffar Ali',
      englishDesignation: 'Associate Editor'
    },
    {
      name: 'विवेक सिंह जादौन',
      designation: 'प्रबंध संपादक',
      phone: '9782486305',
      englishName: 'Vivek Singh Jadon',
      englishDesignation: 'Managing Editor'
    },
    {
      name: 'दिव्या शेखावत',
      designation: 'डिजिटल हेड',
      phone: '9549857213',
      englishName: 'Divya Shekhawat',
      englishDesignation: 'Digital Head'
    }
  ];

  const handlePhoneClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:hamarasamachar02@gmail.com';
  };

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-2.5 sm:px-3 py-2 sm:py-2.5 border-b border-gray-200">
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity"
          aria-label="Back"
        >
          ‹
        </button>
        <h2 className="text-sm sm:text-base font-bold text-gray-800">राजस्थान हेड फ्रेंचाइजी</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-3 sm:mb-4">
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
                स्टेट फ्रेंचाइजी अधिकृत किया है जिसमें आकाश पांडे मैनेजर है। "हमारा समाचार" की ओर से स्टेट 
                फ्रेंचाइजी अधिकृत इसलिए किया गया है जिससे कि संपूर्ण राजस्थान में सभी जिलों व तहसील में 
                "हमारा समाचार" समाचार पत्र के लिए प्रत्येक जिले में फ्रेंचाइजी दी जाएगी, जिसमें की एक 
                सिक्योरिटी राशि होगी, जिस भी व्यक्ति को "हमारा समाचार" समाचार पत्र में जिले की फ्रेंचाइजी 
                लेनी होगी वह एक तय सिक्योरिटी राशि मैनेजर आकाश पांडे को देकर जिले की फ्रेंचाइजी ले सकते है।
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
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
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
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  2. एग्रीमेंट
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी लेने वाले व्यक्ति के साथ स्टेट फ्रेंचाइजी 500/रुपए के स्टांप पर एक एग्रीमेंट 
                  साइन करेगी जिसमें सभी प्रकार की शर्ते व सुविधाएं लिखी होंगी।
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  3. तहसील से कमीशन
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी के द्वारा अपनी सभी तहसीलों में फ्रेंचाइजी देने के बाद तहसील द्वारा जितना 
                  बिजनेस दिया जाएगा उसका कुछ परसेंट जिला फ्रेंचाइजी को भी प्रत्येक महीने दिया जाएगा।
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
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
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  5. नियंत्रण एवं निरीक्षण
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला फ्रेंचाइजी के द्वारा जितनी भी तहसील फ्रेंचाइजी है उन सभी पर जिला फ्रेंचाइजी का ही 
                  नियंत्रण रहेगा, लेकिन स्टेट फ्रेंचाइजी कभी भी ओचक निरीक्षण कर सकती है।
                </p>
              </div>

              {/* Benefit 6 */}
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                  6. योजनाओं में शामिल
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  जिला व तहसील फ्रेंचाइजी को स्टेट फ्रेंचाइजी के द्वारा कई प्रकार की योजनाओं में शामिल किया 
                  जाएगा।
                </p>
              </div>

              {/* Benefit 7 */}
              <div className="bg-orange-50 rounded-lg p-4 sm:p-5 border-l-4 border-orange-600">
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
          <div className="bg-gray-50 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">मैनेजर</h2>
            <div className="text-sm sm:text-base text-gray-700">
              <p className="font-semibold text-lg mb-2">आकाश पांडे</p>
              <p className="text-gray-600">राजस्थान हेड फ्रेंचाइजी मैनेजर</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5">संपर्क करें</h2>
            
            {/* Email */}
            <div className="bg-orange-50 rounded-lg p-4 sm:p-5 mb-4 sm:mb-5">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">ईमेल</h3>
              <button
                onClick={handleEmailClick}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-base sm:text-lg font-medium">hamarasamachar02@gmail.com</span>
              </button>
            </div>

            {/* Editorial Team */}
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map((member, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                        {member.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 mb-1">
                        {member.designation}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {member.englishName} - {member.englishDesignation}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePhoneClick(member.phone)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{member.phone}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}
      <BottomNavbar />
    </div>
  );
}

export default FranchisePage;

