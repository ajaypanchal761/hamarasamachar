import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import logo from '../assets/samachar-logo.png';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(usernameOrEmail, password, rememberMe);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'गलत क्रेडेंशियल्स। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-3 sm:px-4 py-4 sm:py-6 md:py-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src={logo} 
              alt="हमारा समाचार Logo" 
              className="h-12 sm:h-14 md:h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">एडमिन लॉगिन</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">एडमिन पैनल तक पहुंचने के लिए साइन इन करें</p>
        </div>

        {/* Login Form */}
        <div 
          className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 border-t-4 border-orange-600"
        >
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Error Message */}
            {error && (
              <div 
                className="p-3 rounded-lg text-sm"
                style={{ 
                  backgroundColor: '#FEE2E2', 
                  color: '#DC2626',
                  border: '1px solid #FCA5A5'
                }}
              >
                {error}
              </div>
            )}

            {/* Username/Email Input */}
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                उपयोगकर्ता नाम या ईमेल
              </label>
              <input
                id="username"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="उपयोगकर्ता नाम या ईमेल दर्ज करें"
                required
                autoComplete="off"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                पासवर्ड
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड दर्ज करें"
                  required
                  autoComplete="new-password"
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-600 transition-colors pr-10 sm:pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 focus:ring-2 focus:ring-orange-500 accent-orange-600"
                  disabled={loading}
                />
                <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-700">मुझे याद रखें</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement forgot password
                  alert('पासवर्ड भूल गए सुविधा जल्द ही आ रही है');
                }}
                className="text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                disabled={loading}
              >
                पासवर्ड भूल गए?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !usernameOrEmail || !password}
              className={`w-full py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                loading || !usernameOrEmail || !password
                  ? 'bg-gray-400'
                  : 'bg-orange-600 hover:bg-orange-700 active:bg-orange-800'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  लॉगिन हो रहा है...
                </span>
              ) : (
                'लॉगिन करें'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-600">
          <p>© 2024 हमारा समाचार. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;

