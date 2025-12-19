import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import Modal from '../components/Modal';
import { ratingService } from '../services/ratingService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const RatingsPage = () => {
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [ratings, setRatings] = useState([]);
    const [stats, setStats] = useState({ average: 0, total: 0, recent: [] });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        rating: '',
        search: '',
        startDate: '',
        endDate: '',
        sortBy: 'date'
    });
    const [selectedRating, setSelectedRating] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                ratingService.getAllRatings(filters),
                ratingService.getRatingStats()
            ]);
            setRatings(listRes.data);
            setStats(statsRes);
        } catch (error) {
            showToast('रेटिंग लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        try {
            await ratingService.addReply(selectedRating.id, replyText);
            showToast('रिप्लाई भेजा गया', 'success');
            setIsModalOpen(false);
            fetchData(); // Refresh to show reply
        } catch (error) {
            showToast('रिप्लाई भेजने में विफल', 'error');
        }
    };

    const handleDelete = async (row) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस रेटिंग को हटाना चाहते हैं?',
            type: 'danger'
        });
        if (confirmed) {
            try {
                await ratingService.deleteRating(row.id);
                showToast('रेटिंग हटा दी गई', 'success');
                fetchData();
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Rating', 'Comment', 'User Phone', 'User ID', 'Date', 'Reply'];
        const csvData = ratings.map(r => [
            r.id,
            r.rating,
            `"${r.comment.replace(/"/g, '""')}"`,
            r.user ? r.user.phone || 'N/A' : 'Anonymous',
            r.user ? r.user.id : 'N/A',
            new Date(r.date).toLocaleDateString(),
            `"${(r.reply || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ratings_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'rating',
            label: 'रेटिंग',
            sortable: true,
            render: (val) => (
                <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-4 h-4 ${i < val ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
            )
        },
        {
            key: 'comment',
            label: 'टिप्पणी',
            render: (val) => <span className="line-clamp-2 text-sm text-gray-700">{val || '-'}</span>
        },
        {
            key: 'user',
            label: 'उपयोगकर्ता',
            render: (val) => val ? (
                <div className="flex flex-col">
                    <span className="font-medium text-sm">{val.phone || 'N/A'}</span>
                    <span className="text-xs text-gray-400">ID: {val.id}</span>
                </div>
            ) : <span className="text-gray-400 italic text-sm">Anonymous</span>
        },
        {
            key: 'date',
            label: 'दिनांक',
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
    ];

    const actions = [
        {
            label: 'View/Reply',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            onClick: (row) => {
                setSelectedRating(row);
                setReplyText(row.reply || '');
                setIsModalOpen(true);
            },
            variant: 'primary'
        },
        {
            label: 'Delete',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            onClick: (row) => handleDelete(row),
            variant: 'danger'
        }
    ];

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
            <Layout title="रेटिंग और समीक्षा">
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-3 md:gap-6">
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 md:p-6 rounded-xl border border-yellow-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm md:text-base">औसत रेटिंग</p>
                                <h3 className="text-2xl md:text-4xl font-bold text-gray-900">{stats.average}</h3>
                                <div className="flex text-yellow-500 mt-1 md:mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-3 h-3 md:w-5 md:h-5 ${i < Math.round(stats.average) ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <div className="p-2 md:p-4 bg-yellow-100 rounded-full text-yellow-600">
                                <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6 rounded-xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                            <div>
                                <p className="text-gray-500 font-medium mb-1 text-sm md:text-base">कुल समीक्षाएँ</p>
                                <h3 className="text-2xl md:text-4xl font-bold text-gray-900">{stats.total}</h3>
                                <p className="text-xs md:text-sm text-green-600 mt-1 md:mt-2 flex items-center">
                                    <svg className="w-3 h-3 md:w-4 md:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    +12%
                                </p>
                            </div>
                            <div className="p-2 md:p-4 bg-blue-100 rounded-full text-blue-600">
                                <svg className="w-5 h-5 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex justify-center md:justify-end">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm md:text-base"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Form.Field
                            type="text"
                            placeholder="समीक्षा में खोजें..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Form.Field
                            type="select"
                            value={filters.rating}
                            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                            options={[
                                { label: 'सभी रेटिंग्स', value: '' },
                                { label: '5 स्टार्स', value: '5' },
                                { label: '4 स्टार्स', value: '4' },
                                { label: '3 स्टार्स', value: '3' },
                                { label: '2 स्टार्स', value: '2' },
                                { label: '1 स्टार', value: '1' }
                            ]}
                        />
                        <Form.Field
                            type="select"
                            value={filters.sortBy}
                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                            options={[
                                { label: 'दिनांक (नया पहले)', value: 'date' },
                                { label: 'रेटिंग (उच्च से निम्न)', value: 'rating' }
                            ]}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Form.Field
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                placeholder="Start"
                            />
                            <Form.Field
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                placeholder="End"
                            />
                        </div>
                    </div>

                    <Table
                        columns={columns.map(col => col.key === 'comment' ? { ...col, className: 'hidden md:table-cell' } : col)}
                        data={ratings}
                        actions={actions}
                        searchable={false}
                        sortable={true}
                        emptyMessage="कोई रेटिंग नहीं मिली"
                    />

                    {/* View/Reply Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="रेटिंग विवरण"
                        footer={
                            <div className="flex gap-2">
                                <button
                                    onClick={handleReplySubmit}
                                    className="px-4 py-2 bg-[#E21E26] text-white rounded hover:bg-[#C21A20]"
                                >
                                    रिप्लाई भेजें
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    बंद करें
                                </button>
                            </div>
                        }
                    >
                        {selectedRating && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-6 h-6 ${i < selectedRating.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(selectedRating.date).toLocaleString()}
                                    </span>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 italic text-lg text-gray-800">
                                    "{selectedRating.comment}"
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">उपयोगकर्ता</p>
                                        <p className="font-semibold">{selectedRating.user ? selectedRating.user.phone || 'N/A' : 'Guest'}</p>
                                        {selectedRating.user && <p className="text-blue-600 text-sm">ID: {selectedRating.user.id}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">आपका रिप्लाई</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#E21E26] focus:border-[#E21E26]"
                                        placeholder="उपयोगकर्ता को धन्यवाद दें या समस्या का समाधान करें..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default RatingsPage;
