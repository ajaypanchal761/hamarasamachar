import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Form from '../components/Form';
import TipTapEditor from '../components/TipTapEditor';
import { COLORS } from '../constants/colors';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getNewsById, createNews, updateNews, deleteNews } from '../services/newsService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

function NewsFormPage() {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const isEditMode = !!id;
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        district: '',
        featuredImage: '',
        videoUrl: '',
        isBreakingNews: false,
        content: '',
        author: '',
        publishDate: new Date().toISOString().split('T')[0],
        status: 'published',
        metaDescription: '',
        tags: ''
    });

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
                const response = await fetch(`${API_BASE_URL}/admin/categories`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Load data for edit mode
    useEffect(() => {
        if (isEditMode && id) {
            const loadNews = async () => {
                setLoading(true);
                try {
                    const result = await getNewsById(id);
                    if (result.success) {
                        const news = result.data;
                        setFormData({
                            title: news.title || '',
                            category: news.categoryId || '',
                            district: news.district || '',
                            featuredImage: news.featuredImage || '',
                            videoUrl: news.videoUrl || '',
                            isBreakingNews: news.isBreakingNews || false,
                            content: news.content || '',
                            author: news.author || '',
                            publishDate: news.publishDate ? new Date(news.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            status: news.status || 'draft',
                            metaDescription: news.metaDescription || '',
                            tags: news.tags || ''
                        });
                        // Set preview
                        if (news.videoUrl) {
                            setMediaPreview(news.videoUrl);
                            setMediaType('video');
                        } else if (news.featuredImage) {
                            setMediaPreview(news.featuredImage);
                            setMediaType('image');
                        }
                    }
                } catch (error) {
                    showToast('समाचार लोड करने में त्रुटि', 'error');
                    console.error('Error loading news:', error);
                } finally {
                    setLoading(false);
                }
            };
            loadNews();
        }
    }, [isEditMode, id]);

    // Removed auto-save - all saves must be manual via Update button

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle editor content changes - ONLY updates local state, does NOT save to backend
    // Content will only be saved when user clicks "अपडेट करें" button
    const handleEditorChange = (html) => {
        setFormData(prev => ({ ...prev, content: html }));
        // NO auto-save here - manual save only via Update button
    };

    const handleMediaFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!isImage && !isVideo && !imageExts.includes(fileExt) && !videoExts.includes(fileExt)) {
            showToast('अमान्य फ़ाइल प्रकार। केवल छवियाँ या वीडियो अपलोड करें।', 'error');
            return;
        }

        // Check file size (100MB max)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            showToast('फ़ाइल का आकार 100MB से कम होना चाहिए', 'error');
            return;
        }

        setMediaFile(file);

        // Determine media type
        if (isVideo || videoExts.includes(fileExt)) {
            setMediaType('video');
            // Create preview URL for video
            const videoURL = URL.createObjectURL(file);
            setMediaPreview(videoURL);
            // Clear image URL
            setFormData(prev => ({ ...prev, featuredImage: '', videoUrl: '' }));
        } else {
            setMediaType('image');
            // Create preview URL for image
            const imageURL = URL.createObjectURL(file);
            setMediaPreview(imageURL);
            // Clear video URL
            setFormData(prev => ({ ...prev, videoUrl: '', featuredImage: '' }));
        }
    };

    const handleRemoveMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        setFormData(prev => ({ ...prev, featuredImage: '', videoUrl: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title || !formData.content || !formData.category) {
            showToast('कृपया सभी आवश्यक फ़ील्ड भरें', 'error');
            return;
        }

        setLoading(true);
        try {
            const newsData = {
                ...formData,
                isBreakingNews: formData.isBreakingNews ? 'true' : 'false'
            };

            // Add media file if uploaded
            if (mediaFile) {
                newsData.mediaFile = mediaFile;
            }

            let result;
            if (isEditMode) {
                result = await updateNews(id, newsData);
            } else {
                result = await createNews(newsData);
            }

            if (result.success) {
                showToast(
                    isEditMode ? 'समाचार सफलतापूर्वक अपडेट किया गया!' : 'समाचार सफलतापूर्वक बनाया गया!',
                    'success'
                );
                setTimeout(() => navigate('/admin/news'), 1500);
            }
        } catch (error) {
            showToast(error.message || 'एक त्रुटि हुई', 'error');
            console.error('Error saving news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस समाचार को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।',
            type: 'danger'
        });
        if (confirmed) {
            setLoading(true);
            try {
                const result = await deleteNews(id);
                if (result.success) {
                    showToast('समाचार सफलतापूर्वक हटा दिया गया!', 'success');
                    setTimeout(() => navigate('/admin/news'), 1500);
                }
            } catch (error) {
                showToast(error.message || 'एक त्रुटि हुई', 'error');
                console.error('Error deleting news:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <>
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
            <Layout
                title={isEditMode ? "समाचार संपादित करें" : "नया समाचार जोड़ें"}
                showPageHeader={true}
                pageHeaderRightContent={
                    <div className="flex items-center gap-2">
                        {isEditMode && (
                            <button
                                onClick={() => window.open(`/news/${id}`, '_blank')}
                                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                                प्रकाशित संस्करण देखें
                            </button>
                        )}
                    </div>
                }
            >
                <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
                    {loading && !formData.title ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E21E26] mx-auto mb-4"></div>
                                <p className="text-gray-600">लोड हो रहा है...</p>
                            </div>
                        </div>
                    ) : (
                        <Form onSubmit={handleSubmit} className="space-y-6">
                            {/* Top Section: Main Info */}
                            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4">
                                    <Form.Field
                                        label="समाचार शीर्षक (Title)"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="यहाँ शीर्षक लिखें..."
                                        required
                                        className="text-lg font-medium"
                                    />

                                    {/* Media Upload Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            मीडिया अपलोड करें (Image/Video Upload)
                                        </label>
                                        <div className="space-y-3">
                                            {/* File Input */}
                                            <div className="flex items-center gap-3">
                                                <label className="flex-1 cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept="image/*,video/*"
                                                        onChange={handleMediaFileChange}
                                                        className="hidden"
                                                        id="media-upload"
                                                    />
                                                    <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#E21E26] transition-colors text-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                        <span className="text-sm text-gray-600">छवि या वीडियो अपलोड करें</span>
                                                    </div>
                                                </label>
                                                {mediaPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveMedia}
                                                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                                    >
                                                        हटाएं
                                                    </button>
                                                )}
                                            </div>

                                            {/* Preview */}
                                            {mediaPreview && (
                                                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                                                    {mediaType === 'video' ? (
                                                        <video
                                                            src={mediaPreview}
                                                            controls
                                                            className="w-full h-64 object-contain bg-black"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={mediaPreview}
                                                            alt="Preview"
                                                            className="w-full h-64 object-contain"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* URL Input (Alternative) */}
                                            <div className="pt-2 border-t border-gray-200">
                                                <Form.Field
                                                    label="या मीडिया URL दर्ज करें (Or Enter Media URL)"
                                                    name="mediaUrl"
                                                    value={formData.videoUrl || formData.featuredImage}
                                                    onChange={(e) => {
                                                        const url = e.target.value;
                                                        // Auto-detect if it's video or image
                                                        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('.mp4') || url.includes('.webm') || url.includes('video')) {
                                                            setFormData(prev => ({ ...prev, videoUrl: url, featuredImage: '' }));
                                                            setMediaPreview(url);
                                                            setMediaType('video');
                                                        } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('image')) {
                                                            setFormData(prev => ({ ...prev, featuredImage: url, videoUrl: '' }));
                                                            setMediaPreview(url);
                                                            setMediaType('image');
                                                        } else if (url) {
                                                            // Default to image if unclear
                                                            setFormData(prev => ({ ...prev, featuredImage: url, videoUrl: '' }));
                                                            setMediaPreview(url);
                                                            setMediaType('image');
                                                        } else {
                                                            setMediaPreview(null);
                                                            setMediaType(null);
                                                        }
                                                    }}
                                                    placeholder="Image या Video URL दर्ज करें..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            विवरण (Content) <span className="text-red-500">*</span>
                                        </label>
                                        <TipTapEditor
                                            content={formData.content}
                                            onChange={handleEditorChange}
                                            placeholder="विस्तृत समाचार यहाँ लिखें (Bold, Images, Videos आदि का उपयोग करें)..."
                                        />
                                    </div>

                                    <Form.Field
                                        label="मेटा विवरण (SEO Description)"
                                        name="metaDescription"
                                        type="textarea"
                                        value={formData.metaDescription}
                                        onChange={handleChange}
                                        placeholder="160 अक्षरों के भीतर संक्षिप्त विवरण..."
                                        rows={3}
                                        maxLength={160}
                                    />
                                </div>

                                {/* Sidebar Settings */}
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-4 border border-gray-200">
                                        <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">सेटिंग्स</h3>

                                        <Form.Field
                                            label="श्रेणी (Category)"
                                            name="category"
                                            type="select"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                            options={[
                                                { value: '', label: 'चुनें...' },
                                                ...categories.map(cat => ({
                                                    value: cat._id,
                                                    label: cat.name
                                                }))
                                            ]}
                                        />

                                        {categories.find(c => c._id === formData.category)?.name === 'राजस्थान' && (
                                            <Form.Field
                                                label="जिला (District)"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                placeholder="जिला नाम दर्ज करें"
                                            />
                                        )}

                                        <Form.Field
                                            label="स्थिति (Status)"
                                            name="status"
                                            type="select"
                                            value={formData.status}
                                            onChange={handleChange}
                                            options={[
                                                { value: 'draft', label: 'ड्राफ्ट (Draft)' },
                                                { value: 'published', label: 'प्रकाशित (Published)' },
                                                { value: 'archived', label: 'संग्रहीत (Archived)' },
                                            ]}
                                        />

                                        <Form.Field
                                            label="प्रकाशन तिथि (Publish Date)"
                                            name="publishDate"
                                            type="date"
                                            value={formData.publishDate}
                                            onChange={handleChange}
                                        />

                                        <Form.Field
                                            label="लेखक (Author)"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            placeholder="लेखक का नाम"
                                        />

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="isBreakingNews"
                                                name="isBreakingNews"
                                                checked={formData.isBreakingNews}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-[#E21E26] focus:ring-[#E21E26] border-gray-300 rounded"
                                            />
                                            <label htmlFor="isBreakingNews" className="text-sm font-medium text-gray-700">
                                                इसे ब्रेकिंग न्यूज़ बनाएं
                                            </label>
                                        </div>

                                        <Form.Field
                                            label="टैग्स (Tags)"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder="कोमा से अलग करें (e.g. चुनाव, 2024)"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200">
                                {isEditMode && (
                                    <Form.Button
                                        variant="danger"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 inline mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" />
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                        </svg>
                                        हटाएं
                                    </Form.Button>
                                )}
                                <div className="flex items-center gap-3 ml-auto">
                                    <Form.Button
                                        variant="secondary"
                                        onClick={() => navigate('/admin/news')}
                                        disabled={loading}
                                    >
                                        रद्द करें
                                    </Form.Button>
                                    <Form.Button
                                        type="submit"
                                        variant="primary"
                                        loading={loading}
                                    >
                                        {isEditMode ? 'अपडेट करें' : 'प्रकाशित करें'}
                                    </Form.Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </div>
            </Layout>
        </>
    );
}

export default NewsFormPage;
