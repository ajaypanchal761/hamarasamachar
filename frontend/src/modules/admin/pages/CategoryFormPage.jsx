import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Form from '../components/Form';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

function CategoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { toast, showToast, hideToast } = useToast();
  const { confirmDialog, showConfirm } = useConfirm();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#E21E26',
    order: 1,
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    } else {
      // Set default order for new category
      loadDefaultOrder();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const category = await categoryService.getById(id);
      if (category) {
        setFormData({
          name: category.name || '',
          description: category.description || '',
          icon: category.icon || '',
          color: category.color || '#E21E26',
          order: category.order || 1,
          status: category.status || 'active'
        });
      }
    } catch (error) {
      showToast(error.message || 'श्रेणी लोड करने में विफल', 'error');
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultOrder = async () => {
    try {
      const categories = await categoryService.getAll();
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (error) {
      console.error('Failed to load default order:', error);
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

    if (!formData.name.trim()) {
      newErrors.name = 'श्रेणी नाम आवश्यक है';
    }

    if (formData.order < 1) {
      newErrors.order = 'क्रम 1 या अधिक होना चाहिए';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('कृपया सभी आवश्यक फ़ील्ड भरें', 'error');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await categoryService.update(id, formData);
        showToast('श्रेणी सफलतापूर्वक अपडेट हो गई', 'success');
      } else {
        await categoryService.create(formData);
        showToast('श्रेणी सफलतापूर्वक बनाई गई', 'success');
      }

      setTimeout(() => {
        navigate('/admin/categories');
      }, 1500);
    } catch (error) {
      showToast(error.message || 'श्रेणी सहेजने में विफल', 'error');
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await showConfirm({
      message: 'क्या आप इस श्रेणी को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await categoryService.delete(id);
      showToast('श्रेणी सफलतापूर्वक हटाई गई', 'success');
      setTimeout(() => {
        navigate('/admin/categories');
      }, 1500);
    } catch (error) {
      showToast(error.message || 'श्रेणी हटाने में विफल', 'error');
      console.error('Error deleting category:', error);
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <ProtectedRoute>
        <Layout title={isEdit ? 'श्रेणी संपादित करें' : 'नई श्रेणी जोड़ें'}>
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
      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={!!confirmDialog}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
      <Layout title={isEdit ? 'श्रेणी संपादित करें' : 'नई श्रेणी जोड़ें'}>
        <main className="flex-1 overflow-y-auto mx-2 sm:mx-3 md:mx-4 my-2 sm:my-3 md:my-4 animate-fade-in">

          {/* Form */}
          <div className="w-full">
            <Form onSubmit={handleSubmit}>
              <Form.Field
                label="श्रेणी नाम (हिंदी)"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="उदाहरण: ब्रेकिंग न्यूज़"
                required
                error={errors.name}
                disabled={loading}
              />

              <Form.Field
                label="विवरण (Description)"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="श्रेणी का संक्षिप्त विवरण..."
                rows={3}
                disabled={loading}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Form.Field
                  label="आइकन (Emoji)"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="🔥"
                  disabled={loading}
                />

                <Form.Field
                  label="रंग"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                <Form.Field
                  label="क्रम"
                  name="order"
                  type="number"
                  value={formData.order}
                  onChange={handleInputChange}
                  required
                  error={errors.order}
                  disabled={loading}
                  min="1"
                />

                <Form.Field
                  label="स्थिति"
                  name="status"
                  type="select"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  options={[
                    { value: 'active', label: 'सक्रिय' },
                    { value: 'inactive', label: 'निष्क्रिय' }
                  ]}
                />
              </div>

              <Form.Actions>
                {isEdit && (
                  <Form.Button
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    हटाएं
                  </Form.Button>
                )}
                <Form.Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/categories')}
                  disabled={loading}
                >
                  रद्द करें
                </Form.Button>
                <Form.Button type="submit" variant="primary" loading={loading}>
                  {isEdit ? 'अपडेट करें' : 'सहेजें'}
                </Form.Button>
              </Form.Actions>
            </Form>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default CategoryFormPage;

