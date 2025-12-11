import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerService } from '../services/bannerService';
import { COLORS } from '../constants/colors';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Form from '../components/Form';

function BannerListPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getAll();
      setBanners(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'बैनर लोड करने में विफल' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (banner) => {
    if (!window.confirm(`क्या आप "${banner.title || 'इस बैनर'}" को हटाना चाहते हैं?`)) {
      return;
    }

    try {
      await bannerService.delete(banner.id);
      setMessage({ type: 'success', text: 'बैनर सफलतापूर्वक हटाया गया' });
      loadBanners();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'बैनर हटाने में विफल' });
    }
  };

  const getPositionLabel = (position) => {
    const positions = {
      'homepage_top': 'होमपेज शीर्ष',
      'homepage_middle': 'होमपेज मध्य',
      'category_page': 'श्रेणी पेज',
      'sidebar': 'साइडबार'
    };
    return positions[position] || position;
  };

  const columns = [
    {
      key: 'image',
      label: 'छवियाँ',
      render: (value, row) => {
        // Support both old format (imageUrl) and new format (images array)
        const images = row.images && row.images.length > 0 
          ? row.images 
          : (row.imageUrl ? [{ url: row.imageUrl, link: row.link || '', order: 1 }] : []);
        
        if (images.length === 0) {
          return (
            <div className="flex items-center justify-center">
              <div className="w-16 h-10 sm:w-20 sm:h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                No Image
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1 sm:gap-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={`${row.title || 'Banner'} ${idx + 1}`}
                className="w-12 h-8 sm:w-16 sm:h-10 object-cover rounded border border-gray-300"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="60"%3E%3Crect width="100" height="60" fill="%23ddd"/%3E%3Ctext x="50" y="30" text-anchor="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ))}
          </div>
        );
      }
    },
    {
      key: 'title',
      label: 'शीर्षक',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-xs sm:text-sm">{value || '-'}</span>
      )
    },
    {
      key: 'link',
      label: 'लिंक',
      render: (value, row) => {
        // Support both old format (link) and new format (images array)
        const firstLink = row.images && row.images.length > 0 
          ? row.images[0].link 
          : (row.link || value);
        
        return (
          <a
            href={firstLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-blue-600 hover:underline truncate max-w-[150px] sm:max-w-[200px]"
            title={firstLink}
          >
            {firstLink || '-'}
          </a>
        );
      }
    },
    {
      key: 'position',
      label: 'बैनर स्थिति',
      sortable: true,
      render: (value) => (
        <span className="text-xs sm:text-sm text-gray-700">{getPositionLabel(value)}</span>
      )
    },
    {
      key: 'target',
      label: 'लक्ष्य',
      render: (value) => (
        <span className="text-xs sm:text-sm text-gray-700">
          {value === '_blank' ? 'नई टैब' : 'समान टैब'}
        </span>
      )
    }
  ];

  const actions = [
    {
      label: 'संपादित करें',
      variant: 'primary',
      onClick: (row) => navigate(`/admin/banners/edit/${row.id}`),
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
        <Layout title="बैनर">
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
        title="बैनर"
        pageHeaderRightContent={
          <Form.Button
            onClick={() => navigate('/admin/banners/add')}
            variant="primary"
            className="!px-3 !py-1.5 !text-xs sm:!text-sm !font-medium"
          >
            + नया बैनर जोड़ें
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
            data={banners}
            searchable={true}
            sortable={true}
            actions={actions}
            emptyMessage="कोई बैनर नहीं मिला"
          />
        </main>
      </Layout>
    </ProtectedRoute>
  );
}

export default BannerListPage;

