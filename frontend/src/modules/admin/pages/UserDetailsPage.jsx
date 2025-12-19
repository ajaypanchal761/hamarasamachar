import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Form from '../components/Form';
import { userService } from '../services/userService';
import { useToast } from '../hooks/useToast';
import ProtectedRoute from '../components/ProtectedRoute';

const UserDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await userService.getUserById(id);
            setUser(data);
        } catch (error) {
            showToast('उपयोगकर्ता विवरण लोड करने में विफल', 'error');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = () => {
        navigate(`/admin/users/edit/${id}`);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <Layout title="उपयोगकर्ता विवरण">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E21E26]"></div>
                    </div>
                </Layout>
            </ProtectedRoute>
        );
    }

    if (!user) return null;

    return (
        <ProtectedRoute>
            <Layout
                title="उपयोगकर्ता विवरण"
                showPageHeader={true}
                headerActions={
                    <div className="flex gap-2">
                        <button
                            onClick={handleEditClick}
                            className="px-3 py-1.5 md:px-4 md:py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#C21A20] transition-colors text-sm md:text-base"
                        >
                            संपादित करें
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="px-3 py-1.5 md:px-4 md:py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm md:text-base"
                        >
                            वापस जाएं
                        </button>
                    </div>
                }
            >
                <div className="p-4 sm:p-6 space-y-4 md:space-y-6 animate-fade-in">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl md:text-3xl font-bold">
                            {user.name ? user.name[0] : user.phone.slice(-1)}
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{user.phone}</h2>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {user.status}
                                </span>
                                <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-blue-100 text-blue-700">
                                    {user.gender}
                                </span>
                                <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-purple-100 text-purple-700">
                                    श्रेणी: {user.selectedCategory}
                                </span>
                            </div>
                            <p className="text-gray-500 text-xs md:text-sm">
                                पंजीकरण तिथि: {new Date(user.registrationDate).toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-gray-500 mb-1 text-sm md:text-base">बुकमार्क की गई खबरें</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{user.stats.bookmarks}</h3>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-gray-500 mb-1 text-sm md:text-base">कुल व्यूज</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{user.stats.views}</h3>
                        </div>
                        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-gray-500 mb-1 text-sm md:text-base">कमेंट्स/रिव्यु</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{user.stats.comments}</h3>
                        </div>
                    </div>

                    {/* Bookmarks & Recent Activity (Mock) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 font-semibold text-base md:text-lg text-gray-800">
                                हालिया बुकमार्क्स
                            </div>
                            <div className="p-4 text-center text-gray-500 py-8 text-sm md:text-base">
                                कोई डेटा उपलब्ध नहीं
                                {/* Here you would map through bookmarks */}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 font-semibold text-base md:text-lg text-gray-800">
                                फीडबैक और रेटिंग्स
                            </div>
                            <div className="p-4 text-center text-gray-500 py-8 text-sm md:text-base">
                                कोई डेटा उपलब्ध नहीं
                                {/* Here you would map through specific user feedbacks */}
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </ProtectedRoute>
    );
};

export default UserDetailsPage;
