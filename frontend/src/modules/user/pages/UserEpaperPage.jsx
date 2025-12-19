import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { getUserEpapers } from '../services/epaperService';
import { createPaymentOrder, verifyPayment, getSubscriptionStatus } from '../services/paymentService';
import { getCurrentUser } from '../services/authService';
import { getActivePlans } from '../services/planService';

function UserEpaperPage() {
    const navigate = useNavigate();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [epapers, setEpapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubscription, setShowSubscription] = useState(false);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [userData, setUserData] = useState(null);
    const [plansLoading, setPlansLoading] = useState(true);

    useEffect(() => {
        // Check subscription status from database
        checkSubscriptionStatus();
        // Load epapers
        fetchEpapers();
        // Load user data for prefill
        loadUserData();
        // Load plans from backend
        loadPlans();
    }, []);

    useEffect(() => {
        // Set default selected plan when plans are loaded
        if (plans.length > 0 && !selectedPlan) {
            // Prefer yearly plan, otherwise select first plan
            const yearlyPlan = plans.find(p => p.billingCycle === 'yearly');
            setSelectedPlan(yearlyPlan || plans[0]);
        }
    }, [plans]);

    const loadPlans = async () => {
        try {
            setPlansLoading(true);
            const plansData = await getActivePlans();
            setPlans(plansData);
            // Set default selected plan
            if (plansData.length > 0) {
                const yearlyPlan = plansData.find(p => p.billingCycle === 'yearly');
                setSelectedPlan(yearlyPlan || plansData[0]);
            }
        } catch (error) {
            console.error('Error loading plans:', error);
            // Fallback to empty array if API fails
            setPlans([]);
        } finally {
            setPlansLoading(false);
        }
    };

    const loadUserData = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setUserData(user);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const checkSubscriptionStatus = async () => {
        try {
            const status = await getSubscriptionStatus();
            if (status.success && status.data.isActive) {
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    };

    const fetchEpapers = async () => {
        try {
            setLoading(true);
            const res = await getUserEpapers({ page: 1, limit: 50 });
            setEpapers(res.data || []);
        } catch (error) {
            console.error('Error fetching epapers:', error);
            setEpapers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (processingPayment || !selectedPlan) return;

        try {
            setProcessingPayment(true);

            // Create payment order on backend
            const orderResponse = await createPaymentOrder(
                selectedPlan.planId || selectedPlan.id,
                selectedPlan.billingCycle === 'monthly' ? 'monthly' : 'yearly',
                selectedPlan.price
            );

            if (!orderResponse.success) {
                const errorMsg = orderResponse.message || orderResponse.error || 'Payment order creation failed';
                alert(errorMsg);
                setProcessingPayment(false);
                return;
            }

            const { orderId, amount, keyId } = orderResponse.data;

            // Initialize Razorpay
            const options = {
                key: keyId,
                amount: amount,
                currency: 'INR',
                name: 'Hamara Samachar',
                description: `${selectedPlan.name} Subscription`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // Verify payment on backend
                        const verifyResponse = await verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            selectedPlan.planId || selectedPlan.id,
                            selectedPlan.billingCycle === 'monthly' ? 'monthly' : 'yearly',
                            selectedPlan.price
                        );

                        if (verifyResponse.success) {
                            setIsSubscribed(true);
                            setShowSubscription(false);
                            alert('सब्सक्रिप्शन सफल रहा! अब आप ई-पेपर पढ़ सकते हैं।');
                            // Refresh subscription status
                            await checkSubscriptionStatus();
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        alert('Payment verification failed. Please contact support.');
                    } finally {
                        setProcessingPayment(false);
                    }
                },
                prefill: {
                    contact: userData?.phone || '',
                    email: userData?.email || ''
                },
                theme: {
                    color: '#E21E26'
                },
                modal: {
                    ondismiss: function() {
                        setProcessingPayment(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on('payment.failed', function (response) {
                console.error('Payment failed:', response.error);
                alert('Payment failed. Please try again.');
                setProcessingPayment(false);
            });
            
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization error:', error);
            const errorMsg = error.message || error.error || 'Payment initialization failed. Please try again.';
            alert(errorMsg);
            setProcessingPayment(false);
        }
    };

    const downloadPDF = async (pdfUrl, fileName) => {
        try {
            // Check if it's a Cloudinary URL and add download parameter
            let downloadUrl = pdfUrl;
            if (pdfUrl.includes('cloudinary.com')) {
                // Add fl_attachment parameter to force download from Cloudinary
                if (pdfUrl.includes('?')) {
                    downloadUrl = `${pdfUrl}&fl_attachment=${encodeURIComponent(fileName)}`;
                } else {
                    downloadUrl = `${pdfUrl}?fl_attachment=${encodeURIComponent(fileName)}`;
                }
            }
            
            // Try method 1: Direct download with fetch (works for most cases)
            try {
                const response = await fetch(downloadUrl, {
                    method: 'GET',
                    mode: 'cors',
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF');
                }
                
                // Convert response to blob
                const blob = await response.blob();
                
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                
                // Cleanup
                setTimeout(() => {
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                }, 100);
            } catch (fetchError) {
                // Fallback method: Use anchor tag with download attribute
                console.warn('Fetch method failed, trying direct download:', fetchError);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName;
                link.target = '_blank';
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                }, 100);
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            // Final fallback: open in new tab
            alert('PDF डाउनलोड करने में समस्या हुई। PDF नए टैब में खुल रहा है।');
            window.open(pdfUrl, '_blank');
        }
    };

    const formatDateForFileName = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `Hamara_Samachar_${day}-${month}-${year}.pdf`;
    };

    const handleEpaperClick = async (paper) => {
        if (!isSubscribed) {
            // Check if user is logged in
            const token = localStorage.getItem('userToken');
            if (!token) {
                alert('ई-पेपर पढ़ने के लिए कृपया लॉगिन करें और सब्सक्राइब करें।');
                navigate('/login');
                return;
            }
            setShowSubscription(true);
        } else {
            // Verify subscription status before downloading PDF
            try {
                const status = await getSubscriptionStatus();
                if (status.success && status.data.isActive) {
                    // Download PDF with formatted filename
                    const fileName = formatDateForFileName(paper.date);
                    await downloadPDF(paper.pdfUrl, fileName);
                } else {
                    setIsSubscribed(false);
                    setShowSubscription(true);
                    alert('आपकी सब्सक्रिप्शन समाप्त हो गई है। कृपया नवीनीकरण करें।');
                }
            } catch (error) {
                console.error('Error verifying subscription:', error);
                // Still try to download PDF if verification fails
                const fileName = formatDateForFileName(paper.date);
                await downloadPDF(paper.pdfUrl, fileName);
            }
        }
    };

    if (showSubscription && !isSubscribed) {
        return (
            <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
                {/* Subscription Page Content */}
                <div className="min-h-screen pb-6 relative">
                    <button
                        onClick={() => setShowSubscription(false)}
                        className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="bg-[#E21E26] h-48 rounded-b-[40px] flex flex-col items-center justify-center text-white px-4 text-center">
                        <h2 className="text-2xl font-bold mb-2">प्रीमियम सदस्य बनें</h2>
                        <p className="text-[#E21E26]/10 text-sm">दैनिक ई-पेपर और विज्ञापन मुक्त समाचारों का आनंद लें</p>
                    </div>

                    <div className="px-4 -mt-10 space-y-4">
                        {plansLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E21E26]"></div>
                            </div>
                        ) : plans.length > 0 ? (
                            plans.map((plan) => (
                                <div
                                    key={plan.id || plan.planId}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`bg-white rounded-xl shadow-lg border-2 p-6 transition-all relative ${selectedPlan && (selectedPlan.id === plan.id || selectedPlan.planId === plan.planId) ? 'border-[#E21E26] transform scale-105' : 'border-transparent'
                                        }`}
                                >
                                    {plan.billingCycle === 'yearly' && (
                                        <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                                            BEST VALUE
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                                            <p className="text-gray-500 text-sm">{plan.period}</p>
                                        </div>
                                        <div className="text-2xl font-bold text-[#E21E26]">
                                            ₹{plan.price}
                                        </div>
                                    </div>
                                    <ul className="space-y-2 mb-4">
                                        {plan.features && plan.features.length > 0 ? (
                                            plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-gray-500">No features listed</li>
                                        )}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>कोई प्लान उपलब्ध नहीं है</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 mt-4">
                        <button
                            onClick={handleSubscribe}
                            disabled={processingPayment || !selectedPlan || plansLoading}
                            className={`w-full py-3 bg-[#E21E26] text-white rounded-xl font-bold text-lg shadow-lg transition-colors ${
                                processingPayment || !selectedPlan || plansLoading
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'hover:bg-[#C21A20]'
                            }`}
                        >
                            {processingPayment ? 'प्रोसेसिंग...' : plansLoading ? 'लोड हो रहा है...' : selectedPlan ? `${selectedPlan.name} चुनें (₹${selectedPlan.price})` : 'प्लान चुनें'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-3">
                            नियम और शर्तें लागू। कभी भी रद्द करें।
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="page-transition pb-20 sm:pb-24">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-3 py-2.5 border-b border-gray-200 shadow-sm" style={{ backgroundColor: '#E21E26' }}>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white hover:opacity-80 transition-opacity p-1 flex items-center justify-center"
                        aria-label="Back"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h2 className="text-base font-bold text-white">ई-पेपर</h2>
                    <div className="w-8">
                        {/* Optional: Calendar Icon */}
                    </div>
                </div>

                <div className="p-4">
                    {!isSubscribed && (
                        <div
                            onClick={() => setShowSubscription(true)}
                            className="bg-gradient-to-r from-[#E21E26] to-[#C21A20] rounded-xl p-4 text-white hover:shadow-lg transition-all cursor-pointer mb-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg">प्रीमियम मेंबरशिप</p>
                                    <p className="text-sm opacity-90">ई-पेपर पढ़ने के लिए अभी सब्सक्राइब करें</p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <h3 className="font-bold text-gray-800 mb-4">हालिया ई-पेपर</h3>

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E21E26]"></div>
                        </div>
                    ) : epapers.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {epapers.map((paper) => (
                                <div
                                    key={paper.id || paper._id}
                                    onClick={() => handleEpaperClick(paper)}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer relative"
                                >
                                    <div className="aspect-[3/4] bg-gray-200 relative">
                                        <img
                                            src={paper.coverUrl || 'https://via.placeholder.com/150x200?text=E-paper'}
                                            alt={paper.date}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/150x200?text=E-paper';
                                            }}
                                            className={`w-full h-full object-cover transition-all duration-300 ${!isSubscribed ? 'filter blur-[2px]' : ''}`}
                                        />
                                        {!isSubscribed && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                <div className="bg-black/60 p-2 rounded-full">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                                            <p className="text-white text-sm font-medium">
                                                {new Date(paper.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            कोई ई-पेपर उपलब्ध नहीं है
                        </div>
                    )}
                </div>
            </div>

            <BottomNavbar />
        </div>
    );
}

export default UserEpaperPage;
