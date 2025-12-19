import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import Modal from '../components/Modal';
import { commentService } from '../services/commentService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const CommentListPage = () => {
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [comments, setComments] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });
    const [selectedComment, setSelectedComment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                commentService.getAllComments(filters),
                commentService.getCommentStats()
            ]);
            setComments(listRes.data);
            setStats(statsRes);
        } catch (error) {
            showToast('टिप्पणियां लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await commentService.updateCommentStatus(id, newStatus);
            setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
            // Update stats locally or refetch
            fetchData();
            showToast(`कमेंट ${newStatus === 'Approved' ? 'स्वीकृत' : 'अस्वीकृत'} किया गया`, 'success');
        } catch (error) {
            showToast('अपडेट करने में विफल', 'error');
        }
    };

    const handleReplySubmit = async () => {
        if (!replyText.trim()) return;
        try {
            await commentService.replyToComment(selectedComment.id, replyText);
            showToast('रिप्लाई भेजा गया', 'success');
            setIsModalOpen(false);
            setReplyText('');
            fetchData();
        } catch (error) {
            showToast('रिप्लाई भेजने में विफल', 'error');
        }
    };

    const handleDelete = async (row) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस कमैंट को हटाना चाहते हैं?',
            type: 'danger'
        });
        if (confirmed) {
            try {
                await commentService.deleteComment(row.id);
                setComments(comments.filter(c => c.id !== row.id));
                showToast('कमैंट हटा दिया गया', 'success');
                fetchData();
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

    const columns = [
        {
            key: 'text',
            label: 'कमेंट',
            render: (val) => <span className="line-clamp-2 text-sm text-gray-800">{val}</span>
        },
        {
            key: 'news',
            label: 'समाचार',
            render: (val) => val ? (
                <span className="text-sm font-medium text-blue-600 line-clamp-1 cursor-pointer hover:underline" title={val.title}>{val.title}</span>
            ) : '-'
        },
        {
            key: 'user',
            label: 'उपयोगकर्ता',
            render: (val) => val ? (
                <div className="flex flex-col">
                    <span className="font-medium text-xs">{val.name}</span>
                    <span className="text-xs text-gray-400">{val.contact}</span>
                </div>
            ) : <span className="text-gray-400 italic text-xs">Guest</span>
        },
        {
            key: 'date',
            label: 'दिनांक',
            sortable: true,
            render: (val) => new Date(val).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })
        },
        {
            key: 'status',
            label: 'स्थिति',
            sortable: true,
            render: (val) => {
                let color = 'bg-gray-100 text-gray-700';
                let label = val;
                if (val === 'Approved') { color = 'bg-green-100 text-green-700'; label = 'स्वीकृत'; }
                else if (val === 'Rejected') { color = 'bg-red-100 text-red-700'; label = 'अस्वीकृत'; }
                else if (val === 'Pending') { color = 'bg-yellow-100 text-yellow-700'; label = 'लंबित'; }

                return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{label}</span>;
            }
        }
    ];

    const actions = [
        {
            label: 'Approve',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ),
            onClick: (row) => handleStatusChange(row.id, 'Approved'),
            variant: 'success' // Using custom variant logic or styling
        },
        {
            label: 'Reject',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ),
            onClick: (row) => handleStatusChange(row.id, 'Rejected'),
            variant: 'danger'
        },
        {
            label: 'View/Reply',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            onClick: (row) => {
                setSelectedComment(row);
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

    // Custom filter for actions to show Approve only if not approved, etc. could be done but Table component might not support dynamic actions per row easily without modification. 
    // Assuming Table handles it or we show all. For better UX, we can conditionally render buttons inside the Table or here. 
    // The current Table implementation just iterates actions. We'll stick to that for now.

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

            <Layout title="कमेंट्स मॉडरेशन">
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500 font-medium text-sm">कुल कमेंट्स</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 shadow-sm">
                            <p className="text-yellow-700 font-medium text-sm">लंबित (Pending)</p>
                            <h3 className="text-2xl font-bold text-yellow-800">{stats.pending}</h3>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 shadow-sm">
                            <p className="text-green-700 font-medium text-sm">स्वीकृत (Approved)</p>
                            <h3 className="text-2xl font-bold text-green-800">{stats.approved}</h3>
                        </div>
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
                            <p className="text-red-700 font-medium text-sm">अस्वीकृत (Rejected)</p>
                            <h3 className="text-2xl font-bold text-red-800">{stats.rejected}</h3>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Form.Field
                            type="text"
                            placeholder="खोजें (कमेंट, यूजर, न्यूज)..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Form.Field
                            type="select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            options={[
                                { label: 'सभी स्थितियाँ', value: '' },
                                { label: 'लंबित (Pending)', value: 'Pending' },
                                { label: 'स्वीकृत (Approved)', value: 'Approved' },
                                { label: 'अस्वीकृत (Rejected)', value: 'Rejected' },
                                { label: 'फ्लैग किए गए (Flagged)', value: 'Flagged' }
                            ]}
                        />
                        <div className="flex gap-2">
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

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={comments}
                        actions={actions}
                        searchable={false}
                        sortable={true}
                        emptyMessage="कोई कमैंट नहीं मिला"
                    />

                    {/* View/Reply Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="कमेंट विवरण"
                        footer={
                            <div className="flex gap-2">
                                {selectedComment?.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedComment.id, 'Approved');
                                                setIsModalOpen(false);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedComment.id, 'Rejected');
                                                setIsModalOpen(false);
                                            }}
                                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={handleReplySubmit}
                                    className="px-4 py-2 bg-[#E21E26] text-white rounded hover:bg-[#C21A20]"
                                >
                                    Reply
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        }
                    >
                        {selectedComment && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedComment.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                        selectedComment.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {selectedComment.status}
                                    </span>
                                    <span className="text-gray-500 text-sm">
                                        {new Date(selectedComment.date).toLocaleString()}
                                    </span>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <h4 className="text-xs text-gray-500 mb-1">समाचार समाचार:</h4>
                                    <p className="font-medium text-blue-700">{selectedComment.news?.title}</p>
                                </div>

                                <div className="p-4 border border-gray-200 rounded-lg text-gray-800 bg-white">
                                    "{selectedComment.text}"
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-2">
                                    <span>उपयोगकर्ता: <span className="font-semibold text-gray-900">{selectedComment.user?.name}</span></span>
                                    <span>{selectedComment.user?.contact}</span>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">जवाब लिखें (Reply)</label>
                                    <textarea
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-[#E21E26] focus:border-[#E21E26]"
                                        placeholder="अपना जवाब यहाँ लिखें..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    />
                                </div>

                                {selectedComment.replies && selectedComment.replies.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Replies:</h4>
                                        <div className="space-y-2">
                                            {selectedComment.replies.map((reply, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                                                    <p className="text-gray-800">{reply.text}</p>
                                                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                                                        <span>{reply.user.name}</span>
                                                        <span>{new Date(reply.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal>
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default CommentListPage;
