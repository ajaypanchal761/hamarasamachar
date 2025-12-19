import { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Form from '../components/Form';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { COLORS } from '../constants/colors';
import {
  createPlan,
  deletePlan,
  getPlans,
  getSubscribers,
  getPlanStats,
  updateSubscription,
  deleteSubscription,
} from '../services/planService';

function SubscriptionPlansPage() {
  const { toast, showToast, hideToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ plans: { total: 0, monthly: 0, yearly: 0 } });
  const [formData, setFormData] = useState({
    name: '',
    billingCycle: 'monthly',
    price: '',
    description: '',
  });
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState({
    planId: '',
    plan: 'monthly',
    price: '',
    startDate: '',
    endDate: '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, subscribersData, statsData] = await Promise.all([
        getPlans(),
        getSubscribers(),
        getPlanStats()
      ]);
      setPlans(plansData);
      setSubscribers(subscribersData);
      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('डेटा लोड करने में त्रुटि हुई', 'error');
    } finally {
      setLoading(false);
    }
  };

  const planSummary = useMemo(() => {
    // Use stats from backend if available, otherwise calculate from plans
    if (stats.plans && stats.plans.total > 0) {
      return stats.plans;
    }
    const monthly = plans.filter((p) => p.billingCycle === 'monthly').length;
    const yearly = plans.filter((p) => p.billingCycle === 'yearly').length;
    return { total: plans.length, monthly, yearly };
  }, [plans, stats]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    const { name, billingCycle, price, description } = formData;

    if (!name.trim()) {
      showToast('प्लान का नाम दर्ज करें', 'error');
      return;
    }

    const parsedPrice = Number(price);
    if (!parsedPrice || parsedPrice <= 0) {
      showToast('मान्य कीमत दर्ज करें', 'error');
      return;
    }

    try {
      const newPlan = await createPlan({
        name: name.trim(),
        billingCycle,
        price: parsedPrice,
        description: description.trim(),
      });

      setPlans((prev) => [newPlan, ...prev]);
      setFormData({
        name: '',
        billingCycle: 'monthly',
        price: '',
        description: '',
      });
      showToast('नया प्लान जोड़ दिया गया', 'success');
      // Reload stats
      const statsData = await getPlanStats();
      if (statsData) setStats(statsData);
    } catch (error) {
      showToast(error.message || 'प्लान बनाने में त्रुटि हुई', 'error');
    }
  };

  const handleDeletePlan = async (plan) => {
    const confirmDelete = window.confirm(`"${plan.name}" प्लान हटाएं?`);
    if (!confirmDelete) return;

    try {
      const updatedPlans = await deletePlan(plan.id);
      setPlans(updatedPlans);
      showToast('प्लान हटाया गया', 'info');
      // Reload stats
      const statsData = await getPlanStats();
      if (statsData) setStats(statsData);
    } catch (error) {
      showToast(error.message || 'प्लान हटाने में त्रुटि हुई', 'error');
    }
  };

  const handleEditSubscription = (subscription) => {
    setEditingSubscription(subscription);
    setSubscriptionFormData({
      planId: subscription.planId || '',
      plan: subscription.billingCycle || 'monthly',
      price: subscription.amount || '',
      startDate: subscription.startDate || '',
      endDate: subscription.endDate || '',
      status: subscription.status === 'Active' ? 'active' : subscription.status === 'Expired' ? 'expired' : subscription.status || 'active',
    });
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!editingSubscription) return;

    const { planId, plan, price, startDate, endDate, status } = subscriptionFormData;

    if (!planId.trim()) {
      showToast('प्लान ID दर्ज करें', 'error');
      return;
    }

    const parsedPrice = Number(price);
    if (!parsedPrice || parsedPrice <= 0) {
      showToast('मान्य कीमत दर्ज करें', 'error');
      return;
    }

    if (!startDate || !endDate) {
      showToast('प्रारंभ और समाप्ति तिथि दर्ज करें', 'error');
      return;
    }

    try {
      await updateSubscription(editingSubscription.id, {
        planId: planId.trim(),
        plan,
        price: parsedPrice,
        startDate,
        endDate,
        status,
      });

      setEditingSubscription(null);
      setSubscriptionFormData({
        planId: '',
        plan: 'monthly',
        price: '',
        startDate: '',
        endDate: '',
        status: 'active',
      });
      showToast('सब्सक्रिप्शन अपडेट हो गया', 'success');
      await loadData();
    } catch (error) {
      showToast(error.message || 'सब्सक्रिप्शन अपडेट करने में त्रुटि हुई', 'error');
    }
  };

  const handleDeleteSubscription = async (subscription) => {
    const confirmDelete = window.confirm(`क्या आप वाकई इस सब्सक्रिप्शन को हटाना चाहते हैं?`);
    if (!confirmDelete) return;

    try {
      await deleteSubscription(subscription.id);
      showToast('सब्सक्रिप्शन हटाया गया', 'info');
      await loadData();
    } catch (error) {
      showToast(error.message || 'सब्सक्रिप्शन हटाने में त्रुटि हुई', 'error');
    }
  };

  const planColumns = [
    {
      key: 'name',
      label: 'प्लान',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">
            {row.billingCycle === 'monthly' ? 'मासिक' : 'वार्षिक'}
          </p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'कीमत',
      sortable: true,
      render: (value, row) => (
        <span className="font-semibold" style={{ color: COLORS.header.bg }}>
          ₹{Number(value || 0).toLocaleString('en-IN')} /{' '}
          {row.billingCycle === 'monthly' ? 'माह' : 'वर्ष'}
        </span>
      ),
    },
    {
      key: 'description',
      label: 'विवरण',
      className: 'hidden md:table-cell',
      render: (value) => value || '—',
    },
  ];

  const planActions = [
    {
      label: 'हटाएं',
      variant: 'danger',
      onClick: (row) => handleDeletePlan(row),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  const subscriberColumns = [
    {
      key: 'name',
      label: 'उपयोगकर्ता',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-gray-900">
            {value === 'Unknown' && row.userId ? row.userId : value}
          </p>
          <p className="text-xs text-gray-500">
            {row.userId && value !== 'Unknown' ? `ID: ${row.userId}` : ''} {row.phone ? (row.userId && value !== 'Unknown' ? `· ${row.phone}` : row.phone) : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'planName',
      label: 'प्लान',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {row.billingCycle === 'monthly' ? 'मासिक' : 'वार्षिक'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'स्थिति',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            value === 'Active'
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'भुगतान',
      sortable: true,
      render: (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'startDate',
      label: 'प्रारंभ',
      sortable: true,
    },
    {
      key: 'endDate',
      label: 'समाप्ति',
      className: 'hidden md:table-cell',
      sortable: true,
    },
  ];

  const subscriberActions = [
    {
      label: 'संपादित करें',
      variant: 'primary',
      onClick: (row) => handleEditSubscription(row),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      label: 'हटाएं',
      variant: 'danger',
      onClick: (row) => handleDeleteSubscription(row),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <Layout
        title="सब्सक्रिप्शन प्लान"
      >
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E21E26]"></div>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">कुल प्लान</p>
                  <p className="text-2xl font-bold text-gray-900">{planSummary.total}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">मासिक</p>
                  <p className="text-2xl font-bold text-gray-900">{planSummary.monthly}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">वार्षिक</p>
                  <p className="text-2xl font-bold text-gray-900">{planSummary.yearly}</p>
                </div>
              </div>

          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Create plan form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">नया प्लान जोड़ें</h3>
              <Form onSubmit={handleCreatePlan}>
                <Form.Field
                  label="प्लान का नाम"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="जैसे: प्रीमियम मासिक"
                  required
                />
                <Form.Field
                  label="बिलिंग चक्र"
                  name="billingCycle"
                  type="select"
                  value={formData.billingCycle}
                  onChange={handleInputChange}
                  options={[
                    { label: 'मासिक', value: 'monthly' },
                    { label: 'वार्षिक', value: 'yearly' },
                  ]}
                />
                <Form.Field
                  label="कीमत (₹)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="उदाहरण: 149"
                  min="1"
                  step="1"
                  required
                />
                <Form.Field
                  label="संक्षिप्त विवरण"
                  name="description"
                  type="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="जैसे: 30 दिन की सभी खबरें अनलॉक"
                />
                <Form.Actions>
                  <Form.Button type="submit" variant="primary">
                    प्लान बनाएँ
                  </Form.Button>
                  <Form.Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      setFormData({
                        name: '',
                        billingCycle: 'monthly',
                        price: '',
                        description: '',
                      })
                    }
                  >
                    रीसेट
                  </Form.Button>
                </Form.Actions>
              </Form>
            </div>

            {/* Plan table */}
            <div className="lg:col-span-2">
              <Table
                columns={planColumns}
                data={plans}
                sortable
                searchable
                actions={planActions}
                emptyMessage="अभी कोई प्लान नहीं है"
              />
            </div>
          </div>

          {/* Subscribers table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">सब्सक्राइब किए उपयोगकर्ता</h3>
              <span className="text-xs sm:text-sm text-gray-500">
                {subscribers.length} रिकॉर्ड्स
              </span>
            </div>
            <Table
              columns={subscriberColumns}
              data={subscribers}
              sortable
              searchable
              actions={subscriberActions}
              emptyMessage="सब्सक्रिप्शन रिकॉर्ड उपलब्ध नहीं"
            />
          </div>
            </>
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}

        {/* Edit Subscription Modal */}
        {editingSubscription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">सब्सक्रिप्शन संपादित करें</h3>
                  <button
                    onClick={() => {
                      setEditingSubscription(null);
                      setSubscriptionFormData({
                        planId: '',
                        plan: 'monthly',
                        price: '',
                        startDate: '',
                        endDate: '',
                        status: 'active',
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Form onSubmit={handleUpdateSubscription}>
                  <Form.Field
                    label="प्लान ID"
                    name="planId"
                    value={subscriptionFormData.planId}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, planId: e.target.value })}
                    placeholder="प्लान ID"
                    required
                  />
                  <Form.Field
                    label="बिलिंग चक्र"
                    name="plan"
                    type="select"
                    value={subscriptionFormData.plan}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, plan: e.target.value })}
                    options={[
                      { label: 'मासिक', value: 'monthly' },
                      { label: 'वार्षिक', value: 'yearly' },
                    ]}
                  />
                  <Form.Field
                    label="कीमत (₹)"
                    name="price"
                    type="number"
                    value={subscriptionFormData.price}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, price: e.target.value })}
                    placeholder="उदाहरण: 149"
                    min="1"
                    step="1"
                    required
                  />
                  <Form.Field
                    label="प्रारंभ तिथि"
                    name="startDate"
                    type="date"
                    value={subscriptionFormData.startDate}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, startDate: e.target.value })}
                    required
                  />
                  <Form.Field
                    label="समाप्ति तिथि"
                    name="endDate"
                    type="date"
                    value={subscriptionFormData.endDate}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, endDate: e.target.value })}
                    required
                  />
                  <Form.Field
                    label="स्थिति"
                    name="status"
                    type="select"
                    value={subscriptionFormData.status}
                    onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, status: e.target.value })}
                    options={[
                      { label: 'सक्रिय', value: 'active' },
                      { label: 'समाप्त', value: 'expired' },
                      { label: 'रद्द', value: 'cancelled' },
                    ]}
                  />
                  <Form.Actions>
                    <Form.Button type="submit" variant="primary">
                      अपडेट करें
                    </Form.Button>
                    <Form.Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingSubscription(null);
                        setSubscriptionFormData({
                          planId: '',
                          plan: 'monthly',
                          price: '',
                          startDate: '',
                          endDate: '',
                          status: 'active',
                        });
                      }}
                    >
                      रद्द करें
                    </Form.Button>
                  </Form.Actions>
                </Form>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </ProtectedRoute>
  );
}

export default SubscriptionPlansPage;








