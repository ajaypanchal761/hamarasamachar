import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { COLORS } from '../constants/colors';
import {
  getLeads,
  updateLeadStatus,
  getLeadStats,
} from '../../shared/services/franchiseLeadService';

function JournalistTrainingLeadsPage() {
  const { toast, showToast, hideToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      // Filter by source using API
      const trainingLeads = await getLeads({ source: 'journalist_training_page' });
      setLeads(trainingLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('लीड्स लोड करने में त्रुटि हुई', 'error');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getLeadStats({ source: 'journalist_training_page' });
      setStats({
        total: statsData.total || 0,
        new: statsData.new || 0,
        contacted: statsData.contacted || 0,
        closed: statsData.closed || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      await updateLeadStatus(leadId, status);
      // Refresh leads and stats after update
      await fetchLeads();
      await fetchStats();
      const label =
        status === 'closed'
          ? 'बंद किया गया'
          : status === 'contacted'
            ? 'संपर्क किया गया'
            : 'नया';
      showToast(`लीड ${label}`, 'success');
    } catch (error) {
      console.error('Error updating lead status:', error);
      showToast('लीड स्थिति अपडेट करने में त्रुटि हुई', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'नाम',
      sortable: true,
      render: (value) => (
        <p className="font-semibold text-gray-900">{value}</p>
      ),
    },
    {
      key: 'phone',
      label: 'मोबाइल',
      sortable: true,
      render: (value) => (
        <a
          href={`tel:${value}`}
          className="text-[#E21E26] hover:text-[#c91b22] font-medium"
        >
          {value}
        </a>
      ),
    },
    {
      key: 'qualification',
      label: 'योग्यता',
      sortable: true,
      render: (value) => (
        <span className="text-gray-800">{value || '-'}</span>
      ),
    },
    {
      key: 'age',
      label: 'उम्र',
      sortable: true,
      render: (value) => (
        <span className="text-gray-800">{value ? `${value} वर्ष` : '-'}</span>
      ),
    },
    {
      key: 'address',
      label: 'पता / जिला / तहसील',
      render: (value) => <span className="text-gray-800">{value}</span>,
    },
  ];

  const actions = [
    {
      label: 'संपर्क किया',
      variant: 'secondary',
      onClick: (row) => handleStatusChange(row._id || row.id, 'contacted'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    {
      label: 'बंद करें',
      variant: 'danger',
      onClick: (row) => handleStatusChange(row._id || row.id, 'closed'),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <Layout title="प्रशिक्षण लीड्स">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">कुल प्रशिक्षण लीड्स</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">स्थिति के अनुसार</p>
              <p className="text-sm text-gray-700">
                नया: {stats.new} · संपर्क: {stats.contacted} · बंद: {stats.closed}
              </p>
            </div>
          </div>

          <Table
            columns={columns}
            data={leads}
            sortable
            searchable
            actions={actions}
            emptyMessage={loading ? 'लीड्स लोड हो रहे हैं...' : 'अभी कोई प्रशिक्षण लीड नहीं है'}
            loading={loading}
            className="border border-gray-100"
          />
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        )}
      </Layout>
    </ProtectedRoute>
  );
}

export default JournalistTrainingLeadsPage;

