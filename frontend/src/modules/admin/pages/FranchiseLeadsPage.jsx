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

const statusStyles = {
  new: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  contacted: 'bg-blue-100 text-blue-700 border border-blue-200',
  closed: 'bg-green-100 text-green-700 border border-green-200',
};

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return dateString || '-';
  }
}

function FranchiseLeadsPage() {
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
      const allLeads = await getLeads();
      // Filter only franchise leads
      const franchiseLeads = allLeads.filter(lead => 
        lead.source === 'franchise_application_page' || 
        lead.source === 'franchise_page' ||
        !lead.source // Include old leads without source as franchise
      );
      setLeads(franchiseLeads);
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
      const allLeads = await getLeads();
      const franchiseLeads = allLeads.filter(lead => 
        lead.source === 'franchise_application_page' || 
        lead.source === 'franchise_page' ||
        !lead.source
      );
      
      setStats({
        total: franchiseLeads.length,
        new: franchiseLeads.filter(l => l.status === 'new' || !l.status).length,
        contacted: franchiseLeads.filter(l => l.status === 'contacted').length,
        closed: franchiseLeads.filter(l => l.status === 'closed').length
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
      key: 'address',
      label: 'पता / जिला / तहसील',
      render: (value) => <span className="text-gray-800">{value}</span>,
    },
  ];

  const actions = [
    {
      label: 'संपर्क किया',
      variant: 'secondary',
      onClick: (row) => handleStatusChange(row.id, 'contacted'),
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
      onClick: (row) => handleStatusChange(row.id, 'closed'),
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
      <Layout title="फ्रेंचाइजी लीड्स">
        <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">कुल फ्रेंचाइजी लीड्स</p>
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
            emptyMessage={loading ? 'लीड्स लोड हो रहे हैं...' : 'अभी कोई फ्रेंचाइजी लीड नहीं है'}
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

export default FranchiseLeadsPage;


