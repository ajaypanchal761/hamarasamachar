import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addLead } from '../../shared/services/franchiseLeadService';

// Journalist Training Terms data
const TRAINING_TERMS = [
  'कैंडिडेट 12 पास होना चाहिए।',
  'उम्र 18+ होना चाहिए।',
  'कैंडिडेट की मासिक फीस 1000/होगी।',
  'कैंडिडेट राजस्थान का निवासी होना चाहिए।',
  'जर्नलिस्ट प्रशिक्षण जयपुर में होगा।',
  'प्रशिक्षण के दौरान कैंडिडेट को अस्थाई id card दिया जाएगा।',
  'जर्नलिस्ट प्रशिक्षण केंद्र 6 माह का होगा।',
  'प्रशिक्षण में कैंडिडेट का रूम किराया, खाना खर्चा स्वयं का होगा।',
  'प्रशिक्षण के बाद कैंडिडेट को अनुभव प्रमाण पत्र भी दिया जाएगा।',
  'प्रशिक्षण के बाद कैंडिडेट की बेसिक सैलरी 8000/+रुपए से 12000/+ इंसेंटिव हो सकेगा।',
];

const TRAINING_NOTE = '6 माह प्रशिक्षण के बाद कैंडिडेट को स्वयं के तहसील में ही जॉब करनी है और प्रशिक्षण के बाद इंटरव्यू में कैंडिडेट को पद बताया जाएगा।';

function JournalistTrainingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    qualification: '',
    age: '',
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
          message: 'जर्नलिस्ट प्रशिक्षण आवेदन भेजने के लिए कृपया लॉगिन करें या साइन अप करें',
          redirectTo: '/journalist-training'
        } 
      });
      return;
    }

    const { name, phone, address, qualification, age } = formData;
    if (!name.trim() || !phone.trim() || !address.trim() || !qualification.trim() || !age.trim()) {
      setSubmitMessage('कृपया सभी फ़ील्ड भरें');
      return;
    }

    try {
      setSubmitMessage('भेजा जा रहा है...');
      await addLead({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        source: 'journalist_training_page',
        qualification: qualification.trim(),
        age: age.trim(),
        additionalInfo: `Qualification: ${qualification.trim()}, Age: ${age.trim()}`,
      });
      setSubmitMessage('आवेदन प्राप्त हुआ! टीम आपसे शीघ्र संपर्क करेगी।');
      // Reset fields after a short acknowledgement
      setFormData({ name: '', phone: '', address: '', qualification: '', age: '' });
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
        <h2 className="text-sm sm:text-base font-bold text-white">जर्नलिस्ट प्रशिक्षण केंद्र</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E21E26] mb-3 sm:mb-4">
              जर्नलिस्ट प्रशिक्षण केंद्र
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              दैनिक समाचार पत्र "हमारा समाचार" के द्वारा डिजिटल एडिशन व प्रिंट एडिशन में जर्नलिस्ट प्रशिक्षण सेंटर का संचालन जयपुर में किया जा रहा है ताकि किसी भी संकाय के विद्यार्थी मीडिया क्षेत्र में अपना करियर बना सके।
            </p>
            <p className="text-sm sm:text-base text-gray-700 font-medium">
              राजस्थान के 12 पास विद्यार्थी जर्नलिस्ट प्रशिक्षण ले सकते हैं जिनके लिए नियम व शर्तें निम्न है:
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 space-y-3 text-sm sm:text-base text-gray-800 leading-relaxed">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              जर्नलिस्ट प्रशिक्षण केंद्र के नियम व शर्तें
            </h3>
            <ol className="list-decimal list-inside space-y-2">
              {TRAINING_TERMS.map((term, index) => (
                <li key={index}>{term}</li>
              ))}
            </ol>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="font-semibold text-gray-900 mb-2">नोट:</p>
              <p className="text-gray-700">{TRAINING_NOTE}</p>
            </div>
          </div>

          {/* Training Application Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6 mb-10 sm:mb-12 shadow-sm">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
              प्रशिक्षण के लिए आवेदन करें
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              अपना नाम, मोबाइल नंबर, पता, योग्यता और उम्र भेजें। टीम आपसे शीघ्र संपर्क करेगी।
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  योग्यता (12 पास) *
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleFormChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26]"
                  placeholder="उदा: 12th Arts/Science/Commerce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  उम्र (18+ वर्ष) *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  required
                  min="18"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E21E26] focus:border-[#E21E26]"
                  placeholder="उदा: 20"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#E21E26] text-white font-semibold px-4 py-3 rounded-lg shadow hover:bg-[#c91b22] transition-colors"
              >
                आवेदन भेजें
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

export default JournalistTrainingPage;

