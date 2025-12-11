import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

function AdminDashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();

    // Mock data - replace with API calls later
    const stats = {
      totalNews: {
        published: 1250,
        draft: 45,
        today: 12,
        thisWeek: 89
      },
      categories: {
        total: 15,
        breakdown: [
          { name: 'ब्रेकिंग न्यूज़', count: 320 },
          { name: 'राजनीति', count: 280 },
          { name: 'खेलकूद', count: 250 },
          { name: 'मनोरंजन', count: 200 },
          { name: 'टेक्नोलॉजी', count: 150 },
          { name: 'अन्य', count: 50 }
        ],
        mostPopular: 'ब्रेकिंग न्यूज़'
      },
      breakingNews: {
        active: 5,
        recent: [
          { id: 1, title: 'प्रमुख नीति घोषणा', time: '2 घंटे पहले' },
          { id: 2, title: 'खेल चैंपियनशिप परिणाम', time: '5 घंटे पहले' }
        ]
      },
      userEngagement: {
        totalUsers: 12500,
        totalFeedback: 340,
        averageRating: 4.5
      },
      recentActivity: [
        { id: 1, action: 'बनाया', item: 'समाचार लेख', user: admin?.name || 'एडमिन', time: '10 मिनट पहले' },
        { id: 2, action: 'संपादित', item: 'श्रेणी सेटिंग्स', user: admin?.name || 'एडमिन', time: '1 घंटा पहले' },
        { id: 3, action: 'प्रकाशित', item: 'ब्रेकिंग न्यूज़', user: admin?.name || 'एडमिन', time: '2 घंटे पहले' }
      ]
    };

  return (
    <ProtectedRoute>
      <Layout title="एडमिन डैशबोर्ड" showPageHeader={false}>
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4">
            {/* Quick Actions */}
            <div className="mb-4 sm:mb-5 md:mb-6 flex flex-wrap gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={() => navigate('/admin/news/create')}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base text-white transition-all shadow-md hover:shadow-lg"
                style={{ backgroundColor: COLORS.header.bg }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = COLORS.button.primary.hover;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = COLORS.header.bg;
                }}
              >
                नया समाचार बनाएं
              </button>
              <button
                onClick={() => navigate('/admin/news')}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base border-2 transition-all"
                style={{ 
                  borderColor: COLORS.header.bg,
                  color: COLORS.header.bg,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                सभी समाचार देखें
              </button>
              <button
                onClick={() => navigate('/admin/categories')}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base border-2 transition-all"
                style={{ 
                  borderColor: COLORS.header.bg,
                  color: COLORS.header.bg,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FEE2E2';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                श्रेणियाँ प्रबंधित करें
              </button>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 mb-4 sm:mb-5 md:mb-6">
              {/* Total News Count */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">कुल समाचार संख्या</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">प्रकाशित</span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.header.bg }}>
                      {stats.totalNews.published}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">ड्राफ्ट</span>
                    <span className="text-lg sm:text-xl font-semibold text-gray-800">{stats.totalNews.draft}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">आज</span>
                    <span className="text-lg sm:text-xl font-semibold text-gray-800">{stats.totalNews.today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">इस सप्ताह</span>
                    <span className="text-lg sm:text-xl font-semibold text-gray-800">{stats.totalNews.thisWeek}</span>
                  </div>
                </div>
              </div>

              {/* Category Statistics */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">श्रेणी आंकड़े</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">कुल श्रेणियाँ</span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.header.bg }}>
                      {stats.categories.total}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">सबसे लोकप्रिय</p>
                    <div 
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-sm sm:text-base"
                      style={{ 
                        backgroundColor: COLORS.category.active.bg,
                        color: COLORS.category.active.text
                      }}
                    >
                      {stats.categories.mostPopular}
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">शीर्ष श्रेणियाँ:</p>
                    {stats.categories.breakdown.slice(0, 3).map((cat, idx) => (
                      <div key={idx} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">{cat.name}</span>
                        <span className="font-semibold text-gray-800">{cat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Breaking News */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">ब्रेकिंग न्यूज़</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">सक्रिय</span>
                    <span 
                      className="text-xl sm:text-2xl font-bold px-2 sm:px-3 py-1 rounded-lg"
                      style={{ 
                        backgroundColor: COLORS.breakingNews.bg,
                        color: COLORS.breakingNews.text
                      }}
                    >
                      {stats.breakingNews.active}
                    </span>
                  </div>
                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-700">हाल ही में:</p>
                    {stats.breakingNews.recent.map((item) => (
                      <div key={item.id} className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Engagement */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">उपयोगकर्ता जुड़ाव</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">कुल उपयोगकर्ता</span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: COLORS.header.bg }}>
                      {stats.userEngagement.totalUsers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">प्राप्त फीडबैक</span>
                    <span className="text-lg sm:text-xl font-semibold text-gray-800">
                      {stats.userEngagement.totalFeedback}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base text-gray-600">औसत रेटिंग</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg sm:text-xl font-semibold text-gray-800">
                        {stats.userEngagement.averageRating}
                      </span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: COLORS.breakingNews.bg }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 md:p-6 sm:col-span-2 lg:col-span-1">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">हाल की गतिविधि</h3>
                <div className="space-y-2 sm:space-y-3">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div 
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: COLORS.header.bg }}
                      >
                        <span className="text-xs font-bold" style={{ color: COLORS.header.text }}>
                          {activity.user.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          <span className="font-semibold">{activity.user}</span> {activity.action.toLowerCase()} {activity.item}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default AdminDashboard;

