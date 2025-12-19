import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { bannerService } from '../services/bannerService';
import { categoryService } from '../services/categoryService';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Form from '../components/Form';

function BannerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: '',
    link: '',
    position: 'news_feed',
    category: '',
    status: 'active',
    target: '_blank'
  });

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadBanner();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      // Filter only active categories
      const activeCategories = data.filter(cat => cat.status === 'active');
      setCategories(activeCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to empty array if error
      setCategories([]);
    }
  };

  const loadBanner = async () => {
    try {
      setLoading(true);
      const banner = await bannerService.getById(id);
      if (banner) {
        setFormData({
          title: banner.title || '',
          link: banner.link || '',
          position: banner.position || 'news_feed',
          category: banner.category || '',
          status: banner.status || 'active',
          target: banner.target || '_blank'
        });
        
        // Set preview for existing media
        if (banner.videoUrl) {
          setMediaPreview(banner.videoUrl);
          setMediaType('video');
        } else if (banner.imageUrl) {
          setMediaPreview(banner.imageUrl);
          setMediaType('image');
        }
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

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (100MB max)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'फ़ाइल का आकार 100MB से कम होना चाहिए' });
      return;
    }

    // Check if it's a video file
    const isVideo = file.type && file.type.startsWith('video/');
    const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isVideoByExt = videoExts.includes(fileExt);

    if (isVideo || isVideoByExt) {
      setMediaType('video');
      // Create preview URL for video
      const videoURL = URL.createObjectURL(file);
      setMediaPreview(videoURL);
    } else {
      setMediaType('image');
      // Create preview URL for image
      const imageURL = URL.createObjectURL(file);
      setMediaPreview(imageURL);
    }

    setMediaFile(file);
    
    // Clear errors
    if (errors.media) {
      setErrors(prev => ({ ...prev, media: '' }));
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    // Clear file input
    const fileInput = document.getElementById('banner-media');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if media file is uploaded (for new banner) or exists (for edit)
    if (!isEdit && !mediaFile) {
      newErrors.media = 'कृपया एक छवि या वीडियो अपलोड करें';
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
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title || '');
      submitData.append('link', formData.link || '');
      submitData.append('position', formData.position);
      submitData.append('category', formData.category || '');
      submitData.append('order', formData.order || 0);
      submitData.append('status', formData.status);
      submitData.append('target', formData.target);
      
      // Append media file if uploaded
      if (mediaFile) {
        submitData.append('media', mediaFile);
      }

      if (isEdit) {
        await bannerService.update(id, submitData);
        setMessage({ type: 'success', text: 'बैनर सफलतापूर्वक अपडेट हो गया' });
      } else {
        await bannerService.create(submitData);
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
                label="बैनर शीर्षक (वैकल्पिक)"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="उदाहरण: विशेष ऑफर"
                disabled={loading}
              />

              {/* Single Media Upload (Image or Video) */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  बैनर छवि/वीडियो * {!isEdit && <span className="text-red-500">*</span>}
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 hover:border-[#E21E26] transition-colors">
                  {!mediaPreview ? (
                    <div className="text-center">
                      <input
                        id="banner-media"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaChange}
                        disabled={loading}
                        className="hidden"
                      />
                      <label
                        htmlFor="banner-media"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600 mb-1">
                          छवि या वीडियो अपलोड करें
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, GIF या MP4, WebM (अधिकतम 100MB)
                        </span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      {mediaType === 'video' ? (
                        <div className="relative">
                          <video
                            src={mediaPreview}
                            controls
                            className="w-full h-auto max-h-64 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            disabled={loading}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                            title="हटाएं"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={mediaPreview}
                            alt="Banner preview"
                            className="w-full h-auto max-h-64 object-contain rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            disabled={loading}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                            title="हटाएं"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {errors.media && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.media}</p>
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
                    { value: 'news_feed', label: 'न्यूज़ फीड (हर न्यूज़ के बाद)' },
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

              <Form.Field
                label="श्रेणी (Category) *"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={loading}
                options={[
                  { value: '', label: 'सभी श्रेणियाँ' },
                  ...categories.map(cat => ({ value: cat.name, label: cat.name }))
                ]}
              />


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

