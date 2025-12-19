import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import Modal from '../components/Modal';
import { feedbackService } from '../services/feedbackService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const FeedbackListPage = () => {
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchFeedbacks = async () => {
        setLoading(true);
        try {
            const response = await feedbackService.getAllFeedbacks(filters);
            setFeedbacks(response.data);
        } catch (error) {
            showToast('फीडबैक लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, [filters]); // Re-fetch when filters change (debouncing could be added for search)

    const handleStatusChange = async (id, newStatus) => {
        try {
            await feedbackService.updateStatus(id, newStatus);
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
            if (selectedFeedback && selectedFeedback.id === id) {
                setSelectedFeedback({ ...selectedFeedback, status: newStatus });
            }
            showToast('स्थिति अपडेट की गई', 'success');
        } catch (error) {
            showToast('अपडेट करने में विफल', 'error');
        }
    };

    const handleDelete = async (row) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस फीडबैक को हटाना चाहते हैं?',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await feedbackService.deleteFeedback(row.id);
                setFeedbacks(feedbacks.filter(f => f.id !== row.id));
                showToast('फीडबैक हटा दिया गया', 'success');
                if (isModalOpen && selectedFeedback?.id === row.id) {
                    setIsModalOpen(false);
                }
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['User ID', 'Type', 'Text', 'User Contact', 'Date', 'Status'];
        const csvData = feedbacks.map(f => [
            f.user?.userId || f.id,
            f.type,
            `"${f.text.replace(/"/g, '""')}"`,
            f.user ? f.user.contact : '-',
            new Date(f.date).toLocaleDateString(),
            f.status
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            render: (val, row) => (
                <span className="font-mono text-xs text-gray-600">
                    {row.user?.userId || val}
                </span>
            )
        },
        {
            key: 'type',
            label: 'प्रकार',
            sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'App Feedback' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: 'text',
            label: 'फीडबैक',
            render: (val) => <span className="line-clamp-1">{val}</span>
        },
        {
            key: 'user',
            label: 'उपयोगकर्ता',
            render: (val) => val ? (
                <div className="flex flex-col">
                    <span className="font-medium">{val.userId}</span>
                    <span className="text-xs text-gray-500">{val.contact}</span>
                </div>
            ) : <span className="text-gray-400 italic">-</span>
        },
        {
            key: 'date',
            label: 'दिनांक',
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        },
        {
            key: 'status',
            label: 'स्थिति',
            sortable: true,
            render: (val) => {
                let colorClass = 'bg-gray-100 text-gray-700';
                let label = val;
                if (val === 'New') {
                    colorClass = 'bg-red-100 text-red-700';
                    label = 'नया';
                } else if (val === 'Read') {
                    colorClass = 'bg-yellow-100 text-yellow-700';
                    label = 'पढ़ा गया';
                } else if (val === 'Resolved') {
                    colorClass = 'bg-green-100 text-green-700';
                    label = 'हल किया';
                }
                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>{label}</span>;
            }
        }
    ];

    const actions = [
        {
            label: 'View',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            onClick: (row) => {
                setSelectedFeedback(row);
                setIsModalOpen(true);
                if (row.status === 'New') {
                    handleStatusChange(row.id, 'Read');
                }
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

            <Layout title="फीडबैक प्रबंधन">
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <div className="text-gray-500">
                            कुल फीडबैक: <span className="font-semibold text-gray-900">{feedbacks.length}</span>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                            placeholder="खोजें..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Form.Field
                            type="select"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            options={[
                                { label: 'सभी प्रकार', value: '' },
                                { label: 'App Feedback', value: 'App Feedback' },
                                { label: 'News Feedback', value: 'News Feedback' }
                            ]}
                        />
                        <Form.Field
                            type="select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            options={[
                                { label: 'सभी स्थितियाँ', value: '' },
                                { label: 'नया (New)', value: 'New' },
                                { label: 'पढ़ा गया (Read)', value: 'Read' },
                                { label: 'हल किया (Resolved)', value: 'Resolved' }
                            ]}
                        />
                        <div className="flex gap-2">
                            <Form.Field
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                placeholder="प्रारंभ तिथि"
                            />
                            <Form.Field
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                placeholder="अंतिम तिथि"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={feedbacks}
                        actions={actions}
                        searchable={false} // Handled by server/custom filter
                        sortable={true}
                        emptyMessage="कोई फीडबैक नहीं मिला"
                    />

                    {/* View Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="फीडबैक विवरण"
                        footer={
                            <div className="flex gap-2">
                                {selectedFeedback?.status !== 'Resolved' && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedFeedback.id, 'Resolved');
                                            setIsModalOpen(false);
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        मार्क करें हल (Mark Resolved)
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    बंद करें
                                </button>
                            </div>
                        }
                    >
                        {selectedFeedback && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">दिनांक:</span>
                                        <span className="font-medium">
                                            {new Date(selectedFeedback.date).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedFeedback.status === 'New' ? 'bg-red-100 text-red-700' :
                                        selectedFeedback.status === 'Read' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {selectedFeedback.status}
                                    </span>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-sm text-gray-500 mb-1">फीडबैक:</h4>
                                    <p className="text-gray-800 whitespace-pre-wrap">{selectedFeedback.text}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm text-gray-500">प्रकार:</h4>
                                        <p className="font-medium">{selectedFeedback.type}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm text-gray-500">उपयोगकर्ता:</h4>
                                        {selectedFeedback.user ? (
                                            <div>
                                                <p className="font-medium">{selectedFeedback.user.userId}</p>
                                                <p className="text-sm text-blue-600">{selectedFeedback.user.contact}</p>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">-</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default FeedbackListPage;
