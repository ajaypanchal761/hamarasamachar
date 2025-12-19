import { useNavigate } from 'react-router-dom';

function TermsAndConditionsPage() {
  const navigate = useNavigate();

  const termsContent = [
    {
      number: 1,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में ज्वाइन होने के लिए एजुकेशन मिनिमम किसी भी संकाय से 12 पास होना जरूरी है।'
    },
    {
      number: 2,
      text: 'संपूर्ण राजस्थान में जो कोई भी "हमारा समाचार" दैनिक समाचार पत्र को ज्वाइन करना चाहता है तब 45 दिनों की इंटर्नशिप करना जरूरी है।'
    },
    {
      number: 3,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में ज्वाइन होने के लिए आधार कार्ड,फोटो,अपना कोई पुराना पत्रकारिता का अनुभव ओर पुलिस वेरीफिकेशन जरूरी है।'
    },
    {
      number: 4,
      text: '"हमारा समाचार"दैनिक समाचार पत्र में सबसे पहले 45 दिनों की इंटर्नशिप में केवल खुद ही विज्ञापन लेकर उसका 30% ले सकते हैं व न्यूज भेज सकते हैं।'
    },
    {
      number: 5,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में कोई भी डिजिटल एडिशन में ज्वाइन होना चाहता है उनको भी सबसे पहले 45 दिनों की इंटर्नशिप करना जरूरी है।'
    },
    {
      number: 6,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में डिजिटल एडिशन में ज्वाइन होने के लिए 45 दिनों की इंटर्नशिप में भी समाचार पत्र के सीनियर के द्वारा बाइट लेना सीखना है और कोई न्यूज मौके पर जाकर उसका वीडियो किस तरह बनाते हैं और खुद को वहां फेस करके बाइट तैयार करना सीखना है।'
    },
    {
      number: 7,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में 45 दिनों की इंटर्नशिप के बाद भी पत्रकार को सैलेरी पर नहीं रखा जाएगा।'
    },
    {
      number: 8,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में ज्वाइन होते ही id card ट्रेनी पत्रकार का दिया जाएगा,ये 45 दिनों का ही होगा। जब आप ट्रेंड हो जाते हैं तब आपको दूसरा id card दिया जाएगा।'
    },
    {
      number: 9,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में डिजिटल एडिशन व प्रिंट में ज्वाइन होने के लिए पहले 3 महीने PRO लेटर नहीं दिया जाएगा।'
    },
    {
      number: 10,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में कोई भी ट्रेनी पत्रकार न्यूज भेजते हैं चाहे डिजिटल एडिशन या प्रिंट में,ये राजस्थान हेड फ्रेंचाइजी या मुख्य कार्यालय से इजाजत मिलने के बाद ही लगाई जाएगी।'
    },
    {
      number: 11,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में ज्वाइन होने पर id card लेने से पहले 50/रूपये के स्टांप पर समाचार पत्र के द्वारा भेजा गया शपथ पत्र अपने हस्ताक्षर करके जमा करवाना होगा,उसके बाद id card दिया जाएगा।'
    },
    {
      number: 12,
      text: 'कोई भी व्यक्ति जब तक 6 महीने का अनुभव नहीं ले ले,"हमारा समाचार" की ओर से उसको सैलरी पर नहीं रखा जाएगा।'
    },
    {
      number: 13,
      text: 'कोई व्यक्ति जिसको "हमारा समाचार" दैनिक समाचार पत्र से सैलरी चाहिए,उसको जयपुर में 4 माह रहकर प्रशिक्षण लेकर ही खुद के एरिया में ही सैलरी पर भी जॉब दी जा सकती है लेकिन 4 माह के प्रशिक्षण की फीस माह की 2000/रुपया होगी,बाकी सभी खर्चे रहने,खाने पीने, व अन्य जैसे पेट्रोल मोबाइल ,सभी कुछ उम्मीदवार का ही रहेगा।'
    },
    {
      number: 14,
      text: 'कोई भी व्यक्ति जो "हमारा समाचार" दैनिक समाचार पत्र में जॉब कर रहा होता है उसको कभी किसी से  ब्लैक मेल करके पैसा नहीं उठाना होता है।'
    },
    {
      number: 15,
      text: '"हमारा समाचार" दैनिक समाचार पत्र में जॉब करते हुए कोई प्रशिक्षु पत्रकार या ट्रेंड पत्रकार भी असंवैधानिक या असमाजिक पाया जाता है तब उसको स्वत ही निरस्त माना जाएगा।'
    }
  ];

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
        <h2 className="text-sm sm:text-base font-bold text-white">नियम और शर्तें</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Terms List */}
          <div className="space-y-4 sm:space-y-5">
            {termsContent.map((term, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-sm sm:text-base"
                      style={{ backgroundColor: '#E21E26' }}
                    >
                      {term.number}
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm sm:text-base md:text-lg text-gray-800 leading-relaxed">
                      {term.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-8 sm:mt-10 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              इन नियमों और शर्तों को पढ़कर आप "हमारा समाचार" के साथ जुड़ने के लिए सहमत हैं।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditionsPage;

