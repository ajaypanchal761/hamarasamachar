import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import { dashboardService } from '../services/dashboardService';

function AdminDashboard() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
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
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const dashboardStats = await dashboardService.getStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      // Keep default stats on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="एडमिन डैशबोर्ड" showPageHeader={false}>
          <main className="flex-1 overflow-y-auto p-2 sm:p-3 animate-fade-in">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E21E26' }}></div>
                <p className="text-gray-600">लोड हो रहा है...</p>
              </div>
            </div>
          </main>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="एडमिन डैशबोर्ड" showPageHeader={false}>
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 animate-fade-in">
          {/* Quick Actions */}
          <div className="mb-3 sm:mb-4 flex flex-wrap gap-2 sm:gap-3 animate-slide-up">
            <button
              onClick={() => navigate('/admin/news/create')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm text-white transition-all shadow-md hover:shadow-lg"
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
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm border-2 transition-all"
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
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm border-2 transition-all"
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
            <button
              onClick={() => navigate('/admin/service-information')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm border-2 transition-all"
              style={{
                borderColor: COLORS.header.bg,
                color: COLORS.header.bg,
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#F0F9FF';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              सेवा सूचना प्रबंधित करें
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-3 sm:mb-4 animate-slide-up stagger-1">
            {/* Total News Count - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-[#E21E26]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">समाचार ओवरव्यू</h3>
                <div className="p-2 bg-[#E21E26]/5 rounded-lg text-[#E21E26]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">प्रकाशित</p>
                  <p className="text-xl font-bold text-[#E21E26]">{stats.totalNews.published}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">ड्राफ्ट</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalNews.draft}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">आज</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalNews.today}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">इस सप्ताह</p>
                  <p className="text-xl font-bold text-gray-800">{stats.totalNews.thisWeek}</p>
                </div>
              </div>
            </div>

            {/* Category Statistics - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-[#E21E26]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">श्रेणी विश्लेषण</h3>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-gray-600">कुल श्रेणियाँ</span>
                  <span className="text-2xl font-bold text-[#E21E26]">{stats.categories.total}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">शीर्ष श्रेणियाँ</p>
                  <div className="space-y-2.5">
                    {stats.categories.breakdown.slice(0, 3).map((cat, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700">{cat.name}</span>
                          <span className="text-gray-500 text-xs">{cat.count} लेख</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-[#E21E26] h-1.5 rounded-full"
                            style={{ 
                              width: `${stats.categories.breakdown.length > 0 && stats.categories.breakdown[0].count > 0 
                                ? (cat.count / stats.categories.breakdown[0].count) * 100 
                                : 0}%`, 
                              opacity: 1 - (idx * 0.2) 
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Breaking News - Enhanced */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-[#E21E26]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">ब्रेकिंग न्यूज़</h3>
                <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-yellow-50/50 border border-yellow-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#E21E26]"></span>
                    </span>
                    <span className="text-sm font-bold text-gray-800">सक्रिय</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.breakingNews.active}</span>
                </div>
                <div className="space-y-3">
                  {stats.breakingNews.recent && stats.breakingNews.recent.length > 0 ? (
                    stats.breakingNews.recent.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-default">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1 mb-1">{item.title}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {item.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">कोई ब्रेकिंग न्यूज़ नहीं</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Engagement - Enhanced (Re-adding as Grid Item) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-[#E21E26]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">उपयोगकर्ता रिपोर्ट</h3>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">कुल उपयोगकर्ता</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.userEngagement.totalUsers.toLocaleString()}</p>
                  </div>
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white bg-gray-300`} style={{ backgroundColor: i % 2 === 0 ? '#E21E26' : '#FF6B35', opacity: 0.8 }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-800">{stats.userEngagement.totalFeedback}</p>
                    <p className="text-xs text-gray-500 mt-0.5">फीडबैक</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xl font-bold text-gray-800">{stats.userEngagement.averageRating}</p>
                      <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">औसत रेटिंग</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Enhanced (Double Width) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 col-span-1 md:col-span-2 lg:col-span-2 hover:shadow-md hover:border-[#E21E26]/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-800">हाल की गतिविधि</h3>
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {stats.recentActivity && stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 hover:bg-white transition-all">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: activity.action === 'प्रकाशित' ? '#10B981' : activity.action === 'संपादित' ? '#F59E0B' : '#E21E26' }}
                      >
                        {activity.user ? activity.user.charAt(0) : 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <p className="text-sm font-medium text-gray-900">
                            <span className="font-bold">{activity.user || 'एडमिन'}</span> ने {activity.item} {activity.action}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 sm:mt-0 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">कोई हाल की गतिविधि नहीं</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default AdminDashboard;

