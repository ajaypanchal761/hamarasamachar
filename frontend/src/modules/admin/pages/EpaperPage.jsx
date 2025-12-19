import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import Form from '../components/Form';
import { epaperService } from '../services/epaperService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const EpaperPage = () => {
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [epapers, setEpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Upload Form State
    const [uploadData, setUploadData] = useState({
        date: new Date().toISOString().split('T')[0],
        file: null,
        coverImage: null
    });

    const fetchEpapers = async () => {
        setLoading(true);
        try {
            const response = await epaperService.getAllEpapers();
            setEpapers(response.data);
        } catch (error) {
            showToast('ई-पेपर लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEpapers();
    }, []);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setUploadData({ ...uploadData, [type]: file });
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file) {
            showToast('कृपया PDF फ़ाइल चुनें', 'error');
            return;
        }

        try {
            await epaperService.uploadEpaper(uploadData);
            showToast('ई-पेपर सफलतापूर्वक अपलोड किया गया', 'success');
            setIsUploadModalOpen(false);
            setUploadData({
                date: new Date().toISOString().split('T')[0],
                file: null,
                coverImage: null
            });
            fetchEpapers();
        } catch (error) {
            showToast(error.message || 'अपलोड करने में विफल', 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस ई-पेपर को हटाना चाहते हैं?',
            type: 'danger'
        });
        if (confirmed) {
            try {
                await epaperService.deleteEpaper(id);
                setEpapers(epapers.filter(e => e.id !== id));
                showToast('ई-पेपर हटा दिया गया', 'success');
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

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

            <Layout title="ई-पेपर प्रबंधन">
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Toolbar */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800">दैनिक ई-पेपर</h2>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#C21A20] transition-colors flex items-center gap-2 text-sm md:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            नया अपलोड करें
                        </button>
                    </div>

                    {/* Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E21E26]"></div>
                        </div>
                    ) : epapers.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                            {epapers.map((paper) => (
                                <div key={paper.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                                        <img
                                            src={paper.coverUrl}
                                            alt={`Epaper ${paper.date}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 md:gap-3">
                                            <a
                                                href={paper.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 md:p-2 bg-white rounded-full text-blue-600 hover:bg-blue-50"
                                                title="View PDF"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={() => handleDelete(paper.id)}
                                                className="p-1.5 md:p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-2 md:p-4">
                                        <h3 className="font-semibold text-gray-800 text-sm md:text-base">{new Date(paper.date).toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</h3>
                                        <div className="flex justify-between items-center mt-1 md:mt-2 text-[10px] md:text-xs text-gray-500">
                                            <span className="truncate max-w-[80px] md:max-w-[150px]">{paper.fileName}</span>
                                            <span className="flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {paper.views}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500">कोई ई-पेपर उपलब्ध नहीं है</p>
                        </div>
                    )}

                    {/* Upload Modal */}
                    <Modal
                        isOpen={isUploadModalOpen}
                        onClose={() => setIsUploadModalOpen(false)}
                        title="ई-पेपर अपलोड करें"
                    >
                        <form onSubmit={handleUpload} className="space-y-4">
                            <Form.Field
                                label="प्रकाशन तिथि"
                                type="date"
                                required
                                value={uploadData.date}
                                onChange={(e) => setUploadData({ ...uploadData, date: e.target.value })}
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PDF फ़ाइल</label>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    required
                                    onChange={(e) => handleFileChange(e, 'file')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-[#E21E26] hover:file:bg-red-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">केवल PDF प्रारूप (Max 10MB)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">कवर इमेज (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'coverImage')}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">JPG, PNG (Front Page Thumbnail)</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#E21E26] text-white rounded hover:bg-[#C21A20]"
                                >
                                    अपलोड करें
                                </button>
                            </div>
                        </form>
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default EpaperPage;
