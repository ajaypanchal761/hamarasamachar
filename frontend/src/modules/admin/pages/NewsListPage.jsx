import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import { getAllNews, bulkDeleteNews, updateNewsStatus, duplicateNews } from '../services/newsService';

function NewsListPage() {
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(25);

    // Filters state
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        author: '',
        dateRange: '',
        search: ''
    });

    // Fetch news data
    useEffect(() => {
        loadNews();
    }, [filters, currentPage]);

    const loadNews = async () => {
        setLoading(true);
        try {
            const result = await getAllNews({
                ...filters,
                page: currentPage,
                limit: limit
            });
            if (result.success) {
                setNews(result.data || []);
                setTotal(result.total || 0);
            }
        } catch (error) {
            showToast('समाचार लोड करने में त्रुटि', 'error');
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    // Columns Configuration
    const columns = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedItems(news.map(n => n._id || n.id));
                        } else {
                            setSelectedItems([]);
                        }
                    }}
                    checked={selectedItems.length === news.length && news.length > 0}
                    className="rounded border-gray-300 text-[#E21E26] focus:ring-[#E21E26]"
                />
            ),
            render: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedItems.includes(row._id || row.id)}
                    onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                            setSelectedItems([...selectedItems, row._id || row.id]);
                        } else {
                            setSelectedItems(selectedItems.filter(id => id !== (row._id || row.id)));
                        }
                    }}
                    className="rounded border-gray-300 text-[#E21E26] focus:ring-[#E21E26]"
                />
            ),
            sortable: false
        },
        { key: 'id', label: 'ID', sortable: true, render: (val, row) => row.id || row.sequentialId || 'N/A' },
        {
            key: 'title',
            label: 'शीर्षक',
            sortable: true,
            render: (val) => <span className="font-medium text-gray-900 line-clamp-2">{val}</span>
        },
        {
            key: 'category',
            label: 'श्रेणी',
            sortable: true,
            className: 'hidden md:table-cell',
            render: (val) => (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {val}
                </span>
            )
        },
        { key: 'author', label: 'लेखक', sortable: true, className: 'hidden lg:table-cell' },
        {
            key: 'date',
            label: 'दिनांक',
            sortable: true,
            className: 'hidden lg:table-cell',
            render: (val) => val ? new Date(val).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
        },
        {
            key: 'status',
            label: 'स्थिति',
            sortable: true,
            render: (val, row) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(row._id || row.id);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${val === 'published'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}
                >
                    {val === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                </button>
            )
        }
    ];

    // Actions
    const handleStatusToggle = async (id) => {
        try {
            const newsItem = news.find(n => (n._id || n.id) === id);
            if (!newsItem) return;

            const newStatus = newsItem.status === 'published' ? 'draft' : 'published';
            await updateNewsStatus(id, newStatus);
            
            // Update local state
            setNews(news.map(item =>
                (item._id || item.id) === id
                    ? { ...item, status: newStatus }
                    : item
            ));
            
            showToast(`समाचार ${newStatus === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'} में बदल दिया गया!`, 'success');
        } catch (error) {
            showToast('स्थिति अपडेट करने में त्रुटि', 'error');
            console.error('Error updating status:', error);
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) return;

        const confirmed = await showConfirm({
            message: `क्या आप वाकई ${selectedItems.length} समाचारों पर यह कार्रवाई करना चाहते हैं?`,
            type: 'warning'
        });
        if (confirmed) {
            try {
                if (action === 'delete') {
                    await bulkDeleteNews(selectedItems);
                    showToast(`${selectedItems.length} समाचार सफलतापूर्वक हटा दिए गए!`, 'success');
                    setSelectedItems([]);
                    loadNews();
                } else if (action === 'publish') {
                    // Update each news status
                    await Promise.all(selectedItems.map(id => updateNewsStatus(id, 'published')));
                    showToast(`${selectedItems.length} समाचार प्रकाशित किए गए!`, 'success');
                    setSelectedItems([]);
                    loadNews();
                }
            } catch (error) {
                showToast('कार्रवाई करने में त्रुटि', 'error');
                console.error('Error performing bulk action:', error);
            }
        }
    };

    const rowActions = [
        {
            label: 'देखें',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            ),
            onClick: (row) => navigate(`/admin/news/view/${row._id || row.id}`),
            variant: 'secondary'
        },
        {
            label: 'संपादित करें',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                </svg>
            ),
            onClick: (row) => navigate(`/admin/news/edit/${row._id || row.id}`),
            variant: 'secondary'
        },
        {
            label: 'डुप्लिकेट',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            ),
            onClick: async (row) => {
                try {
                    await duplicateNews(row._id || row.id);
                    showToast('समाचार डुप्लिकेट हो गया!', 'success');
                    loadNews();
                } catch (error) {
                    showToast('डुप्लिकेट करने में त्रुटि', 'error');
                    console.error('Error duplicating news:', error);
                }
            },
            variant: 'secondary'
        },
        {
            label: 'हटाएं',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
            ),
            onClick: async (row) => {
                const confirmed = await showConfirm({
                    message: 'क्या आप वाकई इस समाचार को हटाना चाहते हैं?',
                    type: 'danger'
                });
                if (confirmed) {
                    try {
                        const { deleteNews } = await import('../services/newsService');
                        await deleteNews(row._id || row.id);
                        showToast('समाचार सफलतापूर्वक हटा दिया गया!', 'success');
                        loadNews();
                    } catch (error) {
                        showToast('हटाने में त्रुटि', 'error');
                        console.error('Error deleting news:', error);
                    }
                }
            },
            variant: 'danger'
        }
    ];

    const totalPages = Math.ceil(total / limit);

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
            <Layout title="समाचार प्रबंधन" showPageHeader={true}>
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Actions Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <button
                            onClick={() => navigate('/admin/news/create')}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#C21A20] transition-colors font-semibold flex items-center gap-2 text-sm md:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            नया समाचार जोड़ें
                        </button>

                        {/* Bulk Actions */}
                        {selectedItems.length > 0 && (
                            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                                <span className="px-2 md:px-3 text-xs md:text-sm font-medium text-gray-600 border-r border-gray-200">
                                    {selectedItems.length} चयनित
                                </span>
                                <button
                                    onClick={() => handleBulkAction('publish')}
                                    className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded"
                                    title="प्रकाशित करें"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <path d="m9 11 3 3L22 4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded"
                                    title="हटाएं"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" />
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Form.Field
                            type="select"
                            name="category"
                            placeholder="श्रेणी चुनें"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            options={[
                                { value: '', label: 'सभी श्रेणियाँ' },
                                // Categories will be loaded dynamically if needed
                            ]}
                        />
                        <Form.Field
                            type="select"
                            name="status"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            options={[
                                { value: '', label: 'सभी स्थितियाँ' },
                                { value: 'published', label: 'प्रकाशित' },
                                { value: 'draft', label: 'ड्राफ्ट' }
                            ]}
                        />
                        <Form.Field
                            type="text"
                            name="author"
                            value={filters.author}
                            onChange={(e) => setFilters({ ...filters, author: e.target.value })}
                            placeholder="लेखक खोजें..."
                        />
                        <Form.Field
                            type="date"
                            name="date"
                            value={filters.dateRange}
                            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                            placeholder="तिथि चुनें"
                        />
                    </div>

                    {/* News Table */}
                    {loading ? (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E21E26] mx-auto mb-4"></div>
                                <p className="text-gray-600">लोड हो रहा है...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={news}
                                searchable={true}
                                onSearch={(searchTerm) => setFilters({ ...filters, search: searchTerm })}
                                sortable={true}
                                actions={rowActions}
                                className="shadow-sm"
                                emptyMessage="कोई समाचार नहीं मिला"
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
                                    <div className="text-sm text-gray-500">
                                        कुल <span className="font-semibold">{total}</span> समाचार
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                        >
                                            पिछला
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-[#E21E26] text-white' : 'hover:bg-gray-50'}`}
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        <button
                                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                            अगला
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Layout>
        </ProtectedRoute>
    );
}

export default NewsListPage;
