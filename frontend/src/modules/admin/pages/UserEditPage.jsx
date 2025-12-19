import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Form from '../components/Form';

function UserEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    birthdate: '',
    selectedCategory: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getUserById(id);
      if (user) {
        setFormData({
          phone: user.phone || '',
          gender: user.gender || '',
          birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
          selectedCategory: user.selectedCategory || '',
          status: user.status || 'Active'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'उपयोगकर्ता लोड करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'फ़ोन नंबर आवश्यक है';
    }

    if (!formData.status) {
      newErrors.status = 'स्थिति आवश्यक है';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'कृपया सभी आवश्यक फ़ील्ड भरें' });
      return;
    }

    try {
      setLoading(true);
      await userService.updateUser(id, formData);
      setMessage({ type: 'success', text: 'उपयोगकर्ता सफलतापूर्वक अपडेट हो गया' });

      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'उपयोगकर्ता अपडेट करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('क्या आप इस उपयोगकर्ता को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।')) {
      return;
    }

    try {
      setLoading(true);
      await userService.deleteUser(id);
      setMessage({ type: 'success', text: 'उपयोगकर्ता सफलतापूर्वक हटाया गया' });
      setTimeout(() => {
        navigate('/admin/users');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'उपयोगकर्ता हटाने में विफल' });
      setLoading(false);
    }
  };

  if (loading && !formData.phone) {
    return (
      <ProtectedRoute>
        <Layout title="उपयोगकर्ता संपादित करें">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#E21E26' }}></div>
              <p className="text-gray-600">लोड हो रहा है...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout title="उपयोगकर्ता संपादित करें">
        <main className="flex-1 overflow-y-auto mx-2 sm:mx-3 md:mx-4 my-2 sm:my-3 md:my-4 animate-fade-in">
          {/* Message */}
          {message.text && (
            <div
              className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg ${message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
                }`}
            >
              <p
                className={`text-xs sm:text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Form */}
          <div className="w-full">
            <Form onSubmit={handleSubmit}>
              <Form.Field
                label="फ़ोन नंबर"
                name="phone"
                value={formData.phone}
                disabled={true}
                type="text"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Form.Field
                  label="लिंग"
                  name="gender"
                  type="select"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={loading}
                  options={[
                    { value: '', label: 'चुनें...' },
                    { value: 'Male', label: 'पुरुष' },
                    { value: 'Female', label: 'महिला' },
                    { value: 'Other', label: 'अन्य' }
                  ]}
                />

                <Form.Field
                  label="जन्म तिथि"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Form.Field
                  label="श्रेणी"
                  name="selectedCategory"
                  type="select"
                  value={formData.selectedCategory}
                  onChange={handleInputChange}
                  disabled={loading}
                  options={[
                    { value: '', label: 'चुनें...' },
                    { value: 'Politics', label: 'राजनीति' },
                    { value: 'Sports', label: 'खेल' },
                    { value: 'Technology', label: 'टेक्नोलॉजी' },
                    { value: 'Entertainment', label: 'मनोरंजन' }
                  ]}
                />

                <Form.Field
                  label="स्थिति"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  error={errors.status}
                  disabled={loading}
                  options={[
                    { value: 'Active', label: 'सक्रिय' },
                    { value: 'Blocked', label: 'ब्लॉक' }
                  ]}
                />
              </div>

              <Form.Actions>
                <Form.Button type="submit" variant="primary" loading={loading}>
                  अपडेट करें
                </Form.Button>
                <Form.Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  हटाएं
                </Form.Button>
                <Form.Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/users')}
                  disabled={loading}
                >
                  रद्द करें
                </Form.Button>
              </Form.Actions>
            </Form>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default UserEditPage;
