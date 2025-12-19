import { useNavigate } from 'react-router-dom';


function ContactPage() {
  const navigate = useNavigate();

  const editorialTeam = [
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
        <h2 className="text-sm sm:text-base font-bold text-white">संपर्क करें</h2>
        <div className="w-6 sm:w-8"></div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto">
          {/* Email Section */}
          <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">ईमेल</h2>
            <button
              onClick={handleEmailClick}
              className="flex items-center gap-2 text-[#E21E26] hover:text-[#C21A20] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-base sm:text-lg font-medium">hamarasamachar02@gmail.com</span>
            </button>
          </div>

          {/* Editorial Team Section */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-5">संपादकीय टीम</h2>
            <div className="space-y-3 sm:space-y-4">
              {editorialTeam.map((member, index) => (
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
                      className="flex items-center gap-2 px-4 py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#C21A20] transition-colors text-sm sm:text-base font-medium"
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

          {/* Address Section */}
          <div className="bg-[#E21E26]/5 rounded-lg p-4 sm:p-5 md:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">पता</h2>
            <div className="text-sm sm:text-base text-gray-700">
              <p className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#E21E26] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>42 कॉस्मो कॉलोनी, विनायक रेजिडेंसी, वैशाली नगर जयपुर</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navbar */}

    </div>
  );
}

export default ContactPage;

