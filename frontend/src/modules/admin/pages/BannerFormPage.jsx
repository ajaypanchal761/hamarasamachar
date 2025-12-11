import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bannerService } from '../services/bannerService';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Form from '../components/Form';

function BannerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    images: [{ url: '', link: '', order: 1 }],
    position: 'homepage_top',
    status: 'active',
    target: '_blank'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isEdit) {
      loadBanner();
    }
  }, [id]);

  const loadBanner = async () => {
    try {
      setLoading(true);
      const banner = await bannerService.getById(id);
      if (banner) {
        // Convert old format (single imageUrl) to new format (images array)
        const images = banner.images || (banner.imageUrl ? [{ url: banner.imageUrl, link: banner.link || '', order: 1 }] : [{ url: '', link: '', order: 1 }]);
        setFormData({
          title: banner.title || '',
          images: images,
          position: banner.position || 'homepage_top',
          status: banner.status || 'active',
          target: banner.target || '_blank'
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'बैनर लोड करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (index, field, value) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages[index] = { ...newImages[index], [field]: value };
      return { ...prev, images: newImages };
    });

    if (errors[`images_${index}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`images_${index}`];
        return newErrors;
      });
    }
  };

  const addImage = () => {
    if (formData.images.length >= 3) {
      setMessage({ type: 'error', text: 'अधिकतम 3 छवियाँ जोड़ सकते हैं' });
      return;
    }
    setFormData(prev => {
      const maxOrder = prev.images.length > 0 ? Math.max(...prev.images.map(img => img.order)) : 0;
      return {
        ...prev,
        images: [...prev.images, { url: '', link: '', order: maxOrder + 1 }]
      };
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.images.length === 0) {
      newErrors.images = 'कम से कम एक छवि आवश्यक है';
    } else {
      formData.images.forEach((image, index) => {
        if (!image.url.trim()) {
          newErrors[`images_${index}`] = 'छवि URL आवश्यक है';
        }
        if (!image.link.trim()) {
          newErrors[`images_link_${index}`] = 'बैनर लिंक आवश्यक है';
        } else if (!/^https?:\/\/.+/.test(image.link)) {
          newErrors[`images_link_${index}`] = 'कृपया एक वैध URL दर्ज करें (http:// या https:// के साथ)';
        }
        if (image.order < 1) {
          newErrors[`images_order_${index}`] = 'क्रम 1 या अधिक होना चाहिए';
        }
      });
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
      if (isEdit) {
        await bannerService.update(id, formData);
        setMessage({ type: 'success', text: 'बैनर सफलतापूर्वक अपडेट हो गया' });
      } else {
        await bannerService.create(formData);
        setMessage({ type: 'success', text: 'बैनर सफलतापूर्वक बनाया गया' });
      }

      setTimeout(() => {
        navigate('/admin/banners');
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'बैनर सहेजने में विफल' });
    } finally {
      setLoading(false);
    }
  };


  if (loading && isEdit) {
    return (
      <ProtectedRoute>
        <Layout title={isEdit ? 'बैनर संपादित करें' : 'नया बैनर जोड़ें'}>
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
      <Layout title={isEdit ? 'बैनर संपादित करें' : 'नया बैनर जोड़ें'}>
        <main className="flex-1 overflow-y-auto mx-2 sm:mx-3 md:mx-4 my-2 sm:my-3 md:my-4">
            {/* Message */}
            {message.text && (
              <div
                className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-xs sm:text-sm ${
                    message.type === 'success' ? 'text-green-800' : 'text-red-800'
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
                  label="बैनर शीर्षक (वैकल्पिक)"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="उदाहरण: विशेष ऑफर"
                  disabled={loading}
                />

                {/* Multiple Images */}
                <div className="mb-3 sm:mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">
                      बैनर छवियाँ * (अधिकतम 3)
                    </label>
                    {formData.images.length < 3 && (
                      <button
                        type="button"
                        onClick={addImage}
                        disabled={loading}
                        className="px-2 py-1 text-xs sm:text-sm text-orange-600 hover:text-orange-700 border border-orange-600 rounded hover:bg-orange-50 transition-colors disabled:opacity-50"
                      >
                        + छवि जोड़ें
                      </button>
                    )}
                  </div>
                  
                  {formData.images.map((image, index) => (
                    <div key={index} className="mb-3 p-3 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 mb-2">
                        <div className="flex-1 w-full">
                          <Form.Field
                            label={`छवि ${index + 1} URL *`}
                            name={`image_${index}_url`}
                            value={image.url}
                            onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                            placeholder="https://example.com/banner.jpg"
                            required
                            error={errors[`images_${index}`]}
                            disabled={loading}
                          />
                        </div>
                        <div className="w-full sm:w-24 flex-shrink-0">
                          <Form.Field
                            label="क्रम"
                            name={`image_${index}_order`}
                            type="number"
                            value={image.order}
                            onChange={(e) => handleImageChange(index, 'order', parseInt(e.target.value) || 1)}
                            required
                            error={errors[`images_order_${index}`]}
                            disabled={loading}
                            min="1"
                          />
                        </div>
                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            disabled={loading}
                            className="mt-6 sm:mt-0 px-2 py-1.5 text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center"
                            title="हटाएं"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <Form.Field
                        label={`बैनर लिंक/URL ${index + 1} *`}
                        name={`image_${index}_link`}
                        value={image.link}
                        onChange={(e) => handleImageChange(index, 'link', e.target.value)}
                        placeholder="https://example.com"
                        required
                        error={errors[`images_link_${index}`]}
                        disabled={loading}
                      />
                      
                      {/* Image Preview */}
                      {image.url && (
                        <div className="mt-2 border border-gray-300 rounded-lg p-2 bg-white">
                          <img
                            src={image.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-auto max-h-32 object-contain rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {errors.images && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.images}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <Form.Field
                    label="बैनर स्थिति *"
                    name="position"
                    type="select"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    options={[
                      { value: 'homepage_top', label: 'होमपेज शीर्ष' },
                      { value: 'homepage_middle', label: 'होमपेज मध्य' },
                      { value: 'category_page', label: 'श्रेणी पेज' },
                      { value: 'sidebar', label: 'साइडबार' }
                    ]}
                  />

                  <Form.Field
                    label="लक्ष्य *"
                    name="target"
                    type="select"
                    value={formData.target}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                    options={[
                      { value: '_blank', label: 'नई टैब' },
                      { value: '_self', label: 'समान टैब' }
                    ]}
                  />
                </div>


                <Form.Actions>
                  <Form.Button type="submit" variant="primary" loading={loading}>
                    {isEdit ? 'अपडेट करें' : 'सहेजें'}
                  </Form.Button>
                  <Form.Button
                    type="button"
                    variant="secondary"
                    onClick={() => navigate('/admin/banners')}
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

export default BannerFormPage;

