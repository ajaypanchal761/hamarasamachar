import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';

function AdminProfilePage() {
  const { admin, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    phone: admin?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'प्रोफ़ाइल अपडेट करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: admin?.name || '',
      email: admin?.email || '',
      phone: admin?.phone || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (!admin) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout title="प्रोफ़ाइल">
        <main className="flex-1 overflow-y-auto p-2 sm:p-3 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            {/* Message */}
            {message.text && (
              <div
                className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
              >
                <p className={`text-xs sm:text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {message.text}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div
                className="px-3 sm:px-4 py-3 sm:py-4 text-center"
                style={{ backgroundColor: '#F9FAFB' }}
              >
                <div className="mb-2 sm:mb-3">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto rounded-full flex items-center justify-center text-xl sm:text-2xl md:text-3xl font-bold"
                    style={{
                      backgroundColor: COLORS.header.bg,
                      color: COLORS.header.text
                    }}
                  >
                    {admin.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">{admin.name}</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{admin.email}</p>
                <span
                  className="inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: COLORS.category.default.bg,
                    color: COLORS.category.default.text
                  }}
                >
                  {admin.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                </span>
              </div>

              {/* Profile Details */}
              <div className="px-3 sm:px-4 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">प्रोफ़ाइल जानकारी</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all w-full sm:w-auto"
                      style={{
                        backgroundColor: COLORS.header.bg,
                        color: COLORS.header.text
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = COLORS.button.primary.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = COLORS.header.bg;
                      }}
                    >
                      प्रोफ़ाइल संपादित करें
                    </button>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      पूरा नाम
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{ focusRingColor: COLORS.header.bg }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.header.bg;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D1D5DB';
                        }}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{admin.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      ईमेल
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{ focusRingColor: COLORS.header.bg }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.header.bg;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D1D5DB';
                        }}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{admin.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      फ़ोन
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                        style={{ focusRingColor: COLORS.header.bg }}
                        onFocus={(e) => {
                          e.target.style.borderColor = COLORS.header.bg;
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D1D5DB';
                        }}
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{admin.phone}</p>
                    )}
                  </div>

                  {/* Username (Read-only) */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      उपयोगकर्ता नाम
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">{admin.username}</p>
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm text-white transition-all disabled:opacity-50"
                        style={{ backgroundColor: COLORS.header.bg }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = COLORS.button.primary.hover;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = COLORS.header.bg;
                          }
                        }}
                      >
                        {loading ? 'सेव हो रहा है...' : 'परिवर्तन सहेजें'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="flex-1 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm border-2 transition-all disabled:opacity-50"
                        style={{
                          borderColor: COLORS.header.bg,
                          color: COLORS.header.bg,
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = '#FEE2E2';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            e.target.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        रद्द करें
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity History Section */}
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">गतिविधि इतिहास</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-900">अंतिम लॉगिन</p>
                      <p className="text-xs text-gray-600">हाल ही में लॉगिन किया</p>
                    </div>
                    <span className="text-xs text-gray-500">अभी</span>
                  </div>
                  {/* More activity items can be added here */}
                </div>
              </div>

              {/* Logout Section */}
              <div className="px-3 sm:px-4 py-3 sm:py-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm text-white transition-all"
                  style={{ backgroundColor: '#DC2626' }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#B91C1C';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#DC2626';
                  }}
                >
                  लॉगआउट
                </button>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default AdminProfilePage;

