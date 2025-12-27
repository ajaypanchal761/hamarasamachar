import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';
import Modal from '../components/Modal';
import { serviceInformationService } from '../services/serviceInformationService';
import { useToast } from '../hooks/useToast';
import { useConfirm } from '../hooks/useConfirm';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ProtectedRoute from '../components/ProtectedRoute';

const ServiceInformationListPage = () => {
    const { toast, showToast, hideToast } = useToast();
    const { confirmDialog, showConfirm } = useConfirm();
    const [serviceInformations, setServiceInformations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        startDate: '',
        endDate: ''
    });
    const [selectedServiceInfo, setSelectedServiceInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchServiceInformations = async () => {
        setLoading(true);
        try {
            const response = await serviceInformationService.getAllServiceInformation(filters);
            setServiceInformations(response.data);
        } catch (error) {
            showToast('सेवा सूचना लोड करने में त्रुटि हुई', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceInformations();
    }, [filters]); // Re-fetch when filters change

    const handleCreateServiceInfo = async () => {
        if (!formData.title.trim() || !formData.message.trim()) {
            showToast('कृपया सभी फ़ील्ड भरें', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const newServiceInfo = await serviceInformationService.createServiceInformation(formData);
            setServiceInformations([newServiceInfo, ...serviceInformations]);
            setIsCreateModalOpen(false);
            setFormData({ title: '', message: '' });
            showToast('सेवा सूचना सफलतापूर्वक भेजी गई', 'success');
        } catch (error) {
            showToast('सेवा सूचना बनाने में विफल', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (row) => {
        const confirmed = await showConfirm({
            message: 'क्या आप वाकई इस सेवा सूचना को हटाना चाहते हैं?',
            type: 'danger'
        });

        if (confirmed) {
            try {
                await serviceInformationService.deleteServiceInformation(row.id);
                setServiceInformations(serviceInformations.filter(info => info.id !== row.id));
                showToast('सेवा सूचना हटा दी गई', 'success');
                if (isModalOpen && selectedServiceInfo?.id === row.id) {
                    setIsModalOpen(false);
                }
            } catch (error) {
                showToast('हटाने में विफल', 'error');
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['Title', 'Message', 'Date', 'Created By'];
        const csvData = serviceInformations.map(info => [
            `"${info.title.replace(/"/g, '""')}"`,
            `"${info.message.replace(/"/g, '""')}"`,
            new Date(info.createdAt).toLocaleDateString(),
            info.createdBy?.name || 'Admin'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `service_information_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const columns = [
        {
            key: 'title',
            label: 'शीर्षक',
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="font-semibold text-gray-900 truncate">{val}</span>
                </div>
            )
        },
        {
            key: 'message',
            label: 'संदेश',
            render: (val) => (
                <div className="max-w-xs">
                    <p className="text-gray-700 line-clamp-2 leading-relaxed">{val}</p>
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'दिनांक',
            sortable: true,
            render: (val) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                        {new Date(val).toLocaleDateString('hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </span>
                    <span className="text-xs text-gray-500">
                        {new Date(val).toLocaleTimeString('hi-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            )
        },
        {
            key: 'createdBy',
            label: 'बनाया गया',
            render: (val) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                            {(val ? val.name : 'व्यवस्थापक').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-sm text-gray-700">{val ? val.name : 'व्यवस्थापक'}</span>
                </div>
            )
        }
    ];

    const actions = [
        {
            label: 'देखें',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            ),
            onClick: (row) => {
                setSelectedServiceInfo(row);
                setIsModalOpen(true);
            },
            variant: 'primary',
            className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
        },
        {
            label: 'हटाएं',
            icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            onClick: (row) => handleDelete(row),
            variant: 'danger',
            className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
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

            <div style={{
                position: (isCreateModalOpen || isModalOpen) ? 'fixed' : 'static',
                top: (isCreateModalOpen || isModalOpen) ? 0 : 'auto',
                left: (isCreateModalOpen || isModalOpen) ? 0 : 'auto',
                right: (isCreateModalOpen || isModalOpen) ? 0 : 'auto',
                bottom: (isCreateModalOpen || isModalOpen) ? 0 : 'auto',
                overflow: (isCreateModalOpen || isModalOpen) ? 'hidden' : 'auto',
                height: (isCreateModalOpen || isModalOpen) ? '100vh' : 'auto'
            }}>
                <Layout title="सेवा सूचना प्रबंधन">
                    <div className="p-6 sm:p-8 space-y-8 animate-fade-in" style={{
                        height: (isCreateModalOpen || isModalOpen) ? '100%' : 'auto',
                        overflow: (isCreateModalOpen || isModalOpen) ? 'hidden' : 'auto'
                    }}>
                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">कुल सेवा सूचनाएं</p>
                                    <p className="text-3xl font-bold text-blue-900 mt-2">{serviceInformations.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-green-600 uppercase tracking-wide">सक्रिय सूचनाएं</p>
                                    <p className="text-3xl font-bold text-green-900 mt-2">{serviceInformations.filter(info => new Date(info.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200/50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">इस महीने</p>
                                    <p className="text-3xl font-bold text-purple-900 mt-2">{serviceInformations.filter(info => {
                                        const infoDate = new Date(info.createdAt);
                                        const now = new Date();
                                        return infoDate.getMonth() === now.getMonth() && infoDate.getFullYear() === now.getFullYear();
                                    }).length}</p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Header Section */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">सेवा सूचना प्रबंधन</h2>
                                    <p className="text-sm text-gray-600">उपयोगकर्ताओं को सूचनाएं भेजें और प्रबंधित करें</p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <button
                                    onClick={handleExportCSV}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-md transform hover:scale-[1.02]"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    CSV निर्यात
                                </button>
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    नई सेवा सूचना
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Filters Section */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">फिल्टर और खोज</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">खोज</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="शीर्षक या संदेश खोजें..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-12 pr-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">प्रारंभ तिथि</label>
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">अंतिम तिथि</label>
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                    className="w-full px-4 py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 focus:bg-white shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Table Section */}
                    <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">सेवा सूचनाएं</h3>
                                    <p className="text-sm text-gray-600">सभी सेवा सूचनाओं की सूची</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-0">
                            <Table
                                columns={columns}
                                data={serviceInformations}
                                actions={actions}
                                searchable={false} // Handled by server/custom filter
                                sortable={true}
                                emptyMessage="कोई सेवा सूचना नहीं मिली"
                            />
                        </div>
                    </div>

                    {/* View Modal */}
                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="सेवा सूचना विवरण"
                        maxWidth="max-w-4xl"
                        footer={
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md"
                            >
                                बंद करें
                            </button>
                        }
                    >
                        {selectedServiceInfo && (
                            <div className="space-y-6">
                                {/* Header with timestamp */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">सृजित तिथि</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {new Date(selectedServiceInfo.createdAt).toLocaleString('hi-IN', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        सक्रिय
                                    </div>
                                </div>

                                {/* Main content */}
                                <div className="bg-white border-2 border-gray-100 p-6 rounded-xl shadow-sm">
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <h4 className="text-lg font-bold text-gray-900">शीर्षक</h4>
                                        </div>
                                        <p className="text-xl font-bold text-gray-800 leading-tight">{selectedServiceInfo.title}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            <h4 className="text-lg font-bold text-gray-900">संदेश</h4>
                                        </div>
                                        <div className="bg-gray-50 border-2 border-gray-200 p-5 rounded-xl">
                                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">{selectedServiceInfo.message}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer info cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200/50 p-5 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold text-blue-900">सृजितकर्ता</h4>
                                        </div>
                                        <p className="text-base font-semibold text-blue-800 ml-13">{selectedServiceInfo.createdBy?.name || 'व्यवस्थापक'}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200/50 p-5 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold text-green-900">वितरण</h4>
                                        </div>
                                        <p className="text-base font-semibold text-green-800 ml-13">सभी पंजीकृत उपयोगकर्ताओं को</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>

                    {/* Create Modal */}
                    <Modal
                        isOpen={isCreateModalOpen}
                        onClose={() => {
                            setIsCreateModalOpen(false);
                            setFormData({ title: '', message: '' });
                        }}
                        title="नई सेवा सूचना बनाएं"
                        maxWidth="max-w-3xl"
                        footer={
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={() => {
                                        setIsCreateModalOpen(false);
                                        setFormData({ title: '', message: '' });
                                    }}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-md"
                                    disabled={isSubmitting}
                                >
                                    रद्द करें
                                </button>
                                <button
                                    onClick={handleCreateServiceInfo}
                                    disabled={isSubmitting}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-sm sm:text-base shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            भेज रहा है...
                                        </div>
                                    ) : 'सभी को भेजें'}
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    शीर्षक <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base bg-gray-50/50 focus:bg-white shadow-sm"
                                    placeholder="सेवा सूचना का आकर्षक शीर्षक दर्ज करें"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    संदेश <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={10}
                                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-100 focus:border-green-500 resize-vertical transition-all duration-200 text-sm sm:text-base bg-gray-50/50 focus:bg-white shadow-sm min-h-[160px] leading-relaxed"
                                    placeholder="सेवा सूचना का विस्तृत संदेश दर्ज करें..."
                                />
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200/50 p-5 rounded-xl shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-blue-900 mb-2">महत्वपूर्ण सूचना</h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            यह सेवा सूचना सभी पंजीकृत उपयोगकर्ताओं को तुरंत भेजी जाएगी। कृपया सटीक और स्पष्ट जानकारी दर्ज करें।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                    </div>
                </Layout>
            </div>
        </ProtectedRoute>
    );
};

export default ServiceInformationListPage;
