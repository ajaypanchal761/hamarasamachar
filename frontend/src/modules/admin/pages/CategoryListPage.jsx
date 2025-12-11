import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../services/categoryService';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';

function CategoryListPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'श्रेणियाँ लोड करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`क्या आप "${category.name}" श्रेणी को हटाना चाहते हैं?`)) {
      return;
    }

    try {
      await categoryService.delete(category.id);
      setMessage({ type: 'success', text: 'श्रेणी सफलतापूर्वक हटाई गई' });
      loadCategories();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'श्रेणी हटाने में विफल' });
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'श्रेणी नाम',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.icon && <span className="text-lg">{row.icon}</span>}
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'newsCount',
      label: 'समाचार संख्या',
      sortable: true,
      render: (value) => (
        <span className="font-semibold" style={{ color: COLORS.header.bg }}>
          {value}
        </span>
      )
    },
    {
      key: 'order',
      label: 'क्रम',
      sortable: true
    },
    {
      key: 'status',
      label: 'स्थिति',
      render: (value) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            value === 'active'
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-gray-100 text-gray-700 border border-gray-300'
          }`}
          style={{
            borderWidth: '0.5px'
          }}
        >
          {value === 'active' ? 'सक्रिय' : 'निष्क्रिय'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'संपादित करें',
      variant: 'primary',
      onClick: (row) => navigate(`/admin/categories/edit/${row.id}`),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      label: 'हटाएं',
      variant: 'danger',
      onClick: handleDelete,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout title="श्रेणियाँ">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: COLORS.header.bg }}></div>
              <p className="text-gray-600">लोड हो रहा है...</p>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout 
        title="श्रेणियाँ"
        pageHeaderRightContent={
          <Form.Button
            onClick={() => navigate('/admin/categories/add')}
            variant="primary"
            className="!px-3 !py-1.5 !text-xs sm:!text-sm !font-medium"
          >
            + नई श्रेणी जोड़ें
          </Form.Button>
        }
      >
        <main className="flex-1 overflow-y-auto mx-2 sm:mx-3 md:mx-4 my-2 sm:my-3 md:my-4">
          {/* Message */}
          {message.text && (
            <div
              className={`mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p
                className={`text-xs sm:text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          {/* Table */}
          <Table
            columns={columns}
            data={categories}
            searchable={true}
            sortable={true}
            actions={actions}
            emptyMessage="कोई श्रेणी नहीं मिली"
          />
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default CategoryListPage;

