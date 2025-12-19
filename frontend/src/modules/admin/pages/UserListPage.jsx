import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import { userService } from '../services/userService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const UserListPage = () => {
    const navigate = useNavigate();
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, newUsers: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        startDate: '',
        endDate: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [listRes, statsRes] = await Promise.all([
                userService.getAllUsers(filters),
                userService.getUserStats()
            ]);
            setUsers(listRes.data);
            setStats(statsRes);
        } catch (error) {
            showToast('उपयोगकर्ताओं को लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleStatusChange = async (row) => {
        const newStatus = row.status === 'Active' ? 'Blocked' : 'Active';
        const action = newStatus === 'Blocked' ? 'block' : 'unblock';

        const confirmed = await showConfirm({
            message: `क्या आप वाकई इस उपयोगकर्ता को ${newStatus === 'Blocked' ? 'ब्लॉक' : 'अनब्लॉक'} करना चाहते हैं?`,
            type: 'warning'
        });

        if (confirmed) {
            try {
                await userService.updateUserStatus(row.id, newStatus);
                setUsers(users.map(u => u.id === row.id ? { ...u, status: newStatus } : u));
                showToast(`उपयोगकर्ता ${newStatus === 'Blocked' ? 'ब्लॉक' : 'अनब्लॉक'} किया गया`, 'success');
            } catch (error) {
                showToast('स्थिति अपडेट करने में विफल', 'error');
            }
        }
    };

    const handleDelete = async (row) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस उपयोगकर्ता को हटाना चाहते हैं?',
            type: 'danger'
        });
        if (confirmed) {
            try {
                await userService.deleteUser(row.id);
                setUsers(users.filter(u => u.id !== row.id));
                if (selectedItems.includes(row.id)) {
                    setSelectedItems(selectedItems.filter(id => id !== row.id));
                }
                showToast('उपयोगकर्ता हटा दिया गया', 'success');
                fetchData(); // Refresh stats
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedItems.length === 0) return;

        let message = '';
        if (action === 'delete') message = `क्या आप वाकई ${selectedItems.length} उपयोगकर्ताओं को हटाना चाहते हैं?`;
        else if (action === 'block') message = `क्या आप वाकई ${selectedItems.length} उपयोगकर्ताओं को ब्लॉक करना चाहते हैं?`;
        else if (action === 'unblock') message = `क्या आप वाकई ${selectedItems.length} उपयोगकर्ताओं को अनब्लॉक करना चाहते हैं?`;

        const confirmed = await showConfirm({
            message,
            type: action === 'delete' ? 'danger' : 'warning'
        });

        if (confirmed) {
            try {
                if (action === 'delete') {
                    await userService.bulkDelete(selectedItems);
                    setUsers(users.filter(u => !selectedItems.includes(u.id)));
                    showToast(`${selectedItems.length} उपयोगकर्ता हटा दिए गए`, 'success');
                } else {
                    const status = action === 'block' ? 'Blocked' : 'Active';
                    await userService.bulkUpdateStatus(selectedItems, status);
                    setUsers(users.map(u => selectedItems.includes(u.id) ? { ...u, status } : u));
                    showToast(`${selectedItems.length} उपयोगकर्ताओं का स्टेटस अपडेट किया गया`, 'success');
                }
                setSelectedItems([]);
                fetchData();
            } catch (error) {
                showToast('कार्रवाई विफल रही', 'error');
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Phone', 'Gender', 'Birthdate', 'Status', 'Registration Date', 'Category'];
        const csvData = users.map(u => [
            u.id,
            u.phone,
            u.gender,
            new Date(u.birthdate).toLocaleDateString(),
            u.status,
            new Date(u.registrationDate).toLocaleDateString(),
            u.selectedCategory
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'select',
            label: (
                <input
                    type="checkbox"
                    onChange={(e) => {
                        if (e.target.checked) setSelectedItems(users.map(u => u.id));
                        else setSelectedItems([]);
                    }}
                    checked={users.length > 0 && selectedItems.length === users.length}
                    className="rounded border-gray-300 text-[#E21E26] focus:ring-[#E21E26]"
                />
            ),
            render: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedItems.includes(row.id)}
                    onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) setSelectedItems([...selectedItems, row.id]);
                        else setSelectedItems(selectedItems.filter(id => id !== row.id));
                    }}
                    className="rounded border-gray-300 text-[#E21E26] focus:ring-[#E21E26]"
                />
            ),
            sortable: false
        },
        { key: 'id', label: 'ID', sortable: true },
        { key: 'phone', label: 'फ़ोन नंबर' },
        { key: 'gender', label: 'लिंग', className: 'hidden lg:table-cell' },
        {
            key: 'birthdate',
            label: 'जन्म तिथि',
            className: 'hidden lg:table-cell',
            render: (val) => new Date(val).toLocaleDateString('hi-IN')
        },
        {
            key: 'selectedCategory',
            label: 'चयनित श्रेणी',
            className: 'hidden md:table-cell',
            render: (val) => <span className="px-2 py-1 bg-gray-100 rounded text-xs">{val}</span>
        },
        {
            key: 'registrationDate',
            label: 'पंजीकरण',
            sortable: true,
            className: 'hidden md:table-cell',
            render: (val) => new Date(val).toLocaleDateString('hi-IN')
        },
        {
            key: 'status',
            label: 'स्थिति',
            sortable: true,
            render: (val) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {val === 'Active' ? 'सक्रिय' : 'ब्लॉक'}
                </span>
            )
        }
    ];

    const actions = [
        {
            label: 'View Details',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            onClick: (row) => navigate(`/admin/users/${row.id}`),
            variant: 'primary'
        },
        {
            label: 'Edit',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            ),
            onClick: (row) => navigate(`/admin/users/edit/${row.id}`),
            variant: 'secondary'
        },
        {
            label: 'Block/Unblock',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
            onClick: (row) => handleStatusChange(row),
            variant: 'warning'
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

            <Layout title="उपयोगकर्ता प्रबंधन">
                <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500 font-medium text-xs md:text-base">कुल उपयोगकर्ता</p>
                            <h3 className="text-xl md:text-3xl font-bold text-gray-900">{stats.total}</h3>
                        </div>
                        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                            <p className="text-gray-500 font-medium text-xs md:text-base">सक्रिय</p>
                            <h3 className="text-xl md:text-3xl font-bold text-green-600">{stats.active}</h3>
                        </div>
                        <div className="bg-white p-3 md:p-6 rounded-xl border border-gray-100 shadow-sm col-span-2 md:col-span-1">
                            <p className="text-gray-500 font-medium text-xs md:text-base">नए (7 दिन)</p>
                            <h3 className="text-xl md:text-3xl font-bold text-blue-600">{stats.newUsers}</h3>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                        {/* Bulk Actions */}
                        {selectedItems.length > 0 ? (
                            <div className="flex gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200 animate-fade-in">
                                <span className="flex items-center px-2 text-sm font-medium text-gray-600 border-r border-gray-300 mr-2">
                                    {selectedItems.length} चयनित
                                </span>
                                <button
                                    onClick={() => handleBulkAction('block')}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                                >
                                    ब्लॉक
                                </button>
                                <button
                                    onClick={() => handleBulkAction('unblock')}
                                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                                >
                                    अनब्लॉक
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                                >
                                    हटाएं
                                </button>
                            </div>
                        ) : (
                            <div />
                        )}

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
                            placeholder="फ़ोन नंबर से खोजें..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                        <Form.Field
                            type="select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            options={[
                                { label: 'सभी स्थितियाँ', value: '' },
                                { label: 'सक्रिय (Active)', value: 'Active' },
                                { label: 'ब्लॉक (Blocked)', value: 'Blocked' }
                            ]}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Form.Field
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                placeholder="Start Date"
                            />
                            <Form.Field
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                placeholder="End Date"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={users}
                        actions={actions}
                        searchable={false}
                        sortable={true}
                        emptyMessage="कोई उपयोगकर्ता नहीं मिला"
                    />
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default UserListPage;
