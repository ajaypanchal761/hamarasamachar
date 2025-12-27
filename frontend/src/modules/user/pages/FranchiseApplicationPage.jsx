import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLead } from '../../shared/services/franchiseLeadService';

// Terms data - can be made dynamic via props or config
const FRANCHISE_TERMS = [
  'जिला फ्रेंचाइजी की सिक्योरिटी राशि - 5 लाख',
  'तहसील फ्रेंचाइजी की सिक्योरिटी राशि - 1.50 लाख',
  'न्यूज व विज्ञापन फ्रेंचाइजी लेने के लिए 500/रुपए के स्टांप पर एग्रीमेंट होगा।',
  'जिला व तहसील फ्रेंचाइजी की सिक्योरिटी राशि रिफंड नहीं है।',
  'जिला फ्रेंचाइजी होल्डर को 3 माह में जिले की सभी तहसीलों की फ्रेंचाइजी दिलवानी है।',
  'जिला फ्रेंचाइजी होल्डर को हर तहसील फ्रेंचाइजी से ₹25,000 बतौर कमीशन मिलेगा।',
  'तहसील फ्रेंचाइजी देते समय सिक्योरिटी पहले लेकर राजस्थान हेड फ्रेंचाइजी में जमा कर रसीद दें; 500/रुपए स्टांप का एग्रीमेंट तहसील फ्रेंचाइजी से करवाकर प्रति कार्यालय में जमा करनी है।',
  'तहसील इनकम में से खर्च निकालकर 15% जिला फ्रेंचाइजी को व 10% राजस्थान हेड फ्रेंचाइजी को देना होगा।',
  'किसी भी असंवैधानिक/असमाजिक गतिविधि या केस दर्ज होने पर फ्रेंचाइजी स्वतः निरस्त मानी जाएगी।',
  'जिला: प्रतिदिन 5000 प्रतियां नगद (300 गिफ्ट), तहसील: प्रतिदिन 1000 प्रतियां नगद (100 गिफ्ट) लेनी होंगी।',
  'तहसील फ्रेंचाइजी 11,000/रुपए सिक्योरिटी लेकर मिनी फ्रेंचाइजी दे सकती है; यह राशि रिफंड नहीं होगी। मिनी फ्रेंचाइजी को रोज 50 प्रतियां नगद व 20 मुफ्त मिलेंगी; प्रति माह ₹2000 विज्ञापन देना अनिवार्य है।',
  'तहसील फ्रेंचाइजी वाले जो मार्केट में किसी को 11000/रुपए वाली फ्रेंचाइजी देंगे उसमें से 1000/जिला फ्रेंचाइजी को ओर 2000/राजस्थान हेड फ्रेंचाइजी को दिया जाएगा।',
  'जिला/तहसील फ्रेंचाइजी एक वर्ष के लिए मान्य; अगले वर्ष पुनः सिक्योरिटी व औपचारिकता आवश्यक।',
  'विज्ञापन पर जिला फ्रेंचाइजी को 35% कमीशन; तहसील विज्ञापन पर जिला को 5% और तहसील को 35%। शेष तुरंत राजस्थान हेड को ट्रांसफर करें।',
  'मासिक न्यूनतम लक्ष्य: जिला ₹50,000 विज्ञापन, तहसील ₹21,000 विज्ञापन (मिनी फ्रेंचाइजी के ₹2000 के अतिरिक्त)।',
];

function FranchiseApplicationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [submitMessage, setSubmitMessage] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication first
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('पहले लॉगिन करें');
      navigate('/login', { 
        state: { 
          message: 'फ्रेंचाइजी आवेदन भेजने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: '/franchise/apply'
        } 
      });
      return;
    }

    const { name, phone, address } = formData;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setSubmitMessage('कृपया सभी फ़ील्ड भरें');
      return;
    }

    try {
      setSubmitMessage('भेजा जा रहा है...');
      await addLead({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        source: 'franchise_application_page',
      });
      setSubmitMessage('अनुरोध प्राप्त हुआ! टीम आपसे शीघ्र संपर्क करेगी।');
      // Reset fields after a short acknowledgement
      setFormData({ name: '', phone: '', address: '' });
      setTimeout(() => setSubmitMessage(''), 4000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('त्रुटि हुई। कृपया पुनः प्रयास करें।');
      setTimeout(() => setSubmitMessage(''), 4000);
    }
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
        <h2 className="text-sm sm:text-base font-bold text-white">फ्रेंचाइजी आवेदन</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E21E26] mb-3 sm:mb-4">
              फ्रेंचाइजी लेने के नियम व शर्तें
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              संपूर्ण राजस्थान में जिस किसी को जिला या तहसील में न्यूज व विज्ञापन फ्रेंचाइजी लेना है उनके लिए नियम व शर्तें
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 space-y-3 text-sm sm:text-base text-gray-800 leading-relaxed">
            <ol className="list-decimal list-inside space-y-2">
              {FRANCHISE_TERMS.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ol>
          </div>

          {/* Franchise Application Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 mb-10 sm:mb-12 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              फ्रेंचाइजी में रुचि दर्ज करें
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              अपना नाम, मोबाइल नंबर और पता भेजें। टीम आपसे शीघ्र संपर्क करेगी।
            </p>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  नाम *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26]"
                  placeholder="अपना पूरा नाम"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  मोबाइल नंबर *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26]"
                  placeholder="उदा: 98XXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  पता / जिला / तहसील *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  rows={3}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26]"
                  placeholder="पूरा पता लिखें"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#E21E26] text-white font-semibold px-4 py-3 rounded-lg shadow hover:bg-[#c91b22] transition-colors"
              >
                अनुरोध भेजें
              </button>
              {submitMessage && (
                <p className={`text-sm font-medium rounded-lg px-3 py-2 ${
                  submitMessage.includes('त्रुटि') || submitMessage.includes('भरें')
                    ? 'text-red-700 bg-red-50 border border-red-200'
                    : submitMessage.includes('भेजा जा रहा')
                    ? 'text-blue-700 bg-blue-50 border border-blue-200'
                    : 'text-green-700 bg-green-50 border border-green-200'
                }`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FranchiseApplicationPage;



