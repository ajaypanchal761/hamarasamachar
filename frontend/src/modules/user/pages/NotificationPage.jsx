import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavbar from '../components/BottomNavbar';
import { getCurrentUser, updateProfile } from '../services/authService';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats
} from '../services/notificationService';

function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    breakingNews: true,
    localNews: true,
    sportsNews: true,
    entertainmentNews: true
  });
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  const loadNotifications = async (page = 1, append = false) => {
    try {
      setLoading(true);
      const response = await getNotifications(page, 20);

      if (response.success) {
        const newNotifications = response.notifications.map(notification => ({
          id: notification._id,
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.sentAt),
          read: notification.isRead,
          type: notification.type,
          data: notification.data
        }));

        setNotifications(prev =>
          append ? [...prev, ...newNotifications] : newNotifications
        );
        setHasNextPage(response.pagination.hasNextPage);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getNotificationStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'अभी';
    if (diffInMinutes < 60) return `${diffInMinutes} मिनट पहले`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} घंटे पहले`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} दिन पहले`;

    return date.toLocaleDateString('hi-IN');
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (isSelectionMode) {
      handleSelect(notification.id);
      return;
    }

    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
        loadStats();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.data?.url) {
      navigate(notification.data.url);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteNotification(id);
      }

      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setIsSelectionMode(false);
      setSelectedIds([]);
      setShowDeleteConfirm(false);
      loadStats();
    } catch (error) {
      console.error('Error deleting notifications:', error);
      alert('नोटिफिकेशन हटाने में समस्या हुई');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      loadStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('सभी नोटिफिकेशन पढ़े हुए मार्क करने में समस्या हुई');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  useEffect(() => {
    loadNotifications();
    loadStats();

    const loadSettings = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.notificationSettings) {
          setNotificationSettings(user.notificationSettings);
        }
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadSettings();
  }, []);

  const handleSettingToggle = async (settingKey) => {
    const newSettings = {
      ...notificationSettings,
      [settingKey]: !notificationSettings[settingKey]
    };
    setNotificationSettings(newSettings);

    try {
      setLoading(true);
      await updateProfile({ notificationSettings: newSettings });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setNotificationSettings(notificationSettings);
      alert('सेटिंग्स सेव करने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-24">
      {/* Header */}
      <div className={`sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 shadow-sm transition-colors duration-300 ${isSelectionMode ? '' : ''}`} style={{ backgroundColor: isSelectionMode ? '#E21E26' : '#E21E26' }}>
        <div className="flex items-center gap-3">
          {isSelectionMode ? (
            <button
              onClick={toggleSelectionMode}
              className="text-white hover:opacity-80 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
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
          )}

          <h2 className="text-base font-bold text-white">
            {isSelectionMode ? `${selectedIds.length} चयनित` : `नोटिफिकेशन्स ${stats.unread > 0 ? `(${stats.unread})` : ''}`}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {isSelectionMode ? (
            <>
              <button
                onClick={handleSelectAll}
                className="text-sm font-semibold text-white hover:opacity-80 transition-colors"
              >
                {selectedIds.length === notifications.length ? 'हटाएं' : 'सभी'}
              </button>
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteClick}
                  className="text-white hover:opacity-80 p-2 rounded-full transition-colors"
                  aria-label="Delete Selected"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <>
              {notifications.length > 0 && stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm font-semibold text-white hover:opacity-80 px-3 py-1.5 rounded-lg transition-colors border border-white/30 hover:border-white/50 mr-2"
                >
                  सभी पढ़े
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={toggleSelectionMode}
                  className="text-sm font-semibold text-white hover:opacity-80 px-3 py-1.5 rounded-lg transition-colors border border-white/30 hover:border-white/50"
                >
                  चुनें
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && currentPage === 1 && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E21E26]"></div>
        </div>
      )}

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelectionMode
                    ? 'cursor-pointer hover:border-[#E21E26]/20'
                    : 'hover:shadow-md border-transparent'
                } ${
                  isSelectionMode && selectedIds.includes(notification.id)
                    ? 'bg-[#E21E26]/5 border-[#E21E26]/20'
                    : notification.read
                    ? 'bg-white border-gray-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Selection Checkbox with Animation */}
                  <div className={`transition-all duration-300 overflow-hidden ${isSelectionMode ? 'w-6 opacity-100' : 'w-0 opacity-0'}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-colors ${selectedIds.includes(notification.id)
                      ? 'bg-[#E21E26] border-[#E21E26]'
                      : 'border-gray-300 bg-white'
                      }`}>
                      <svg className={`w-4 h-4 text-white transform transition-transform duration-200 ${selectedIds.includes(notification.id) ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <h3 className={`text-sm font-bold line-clamp-2 ${notification.read ? 'text-gray-800' : 'text-[#E21E26]'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {hasNextPage && !loading && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => loadNotifications(currentPage + 1, true)}
                  className="px-6 py-2 bg-[#E21E26] text-white rounded-lg hover:bg-[#c21a20] transition-colors"
                >
                  और लोड करें
                </button>
              </div>
            )}
          </>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in px-4">
            <div className="bg-gray-100 p-6 rounded-full mb-4 shadow-sm">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-gray-900 font-semibold mb-2 text-lg">कोई नोटिफिकेशन नहीं</h3>
            <p className="text-gray-500 text-sm max-w-xs">जब भी कोई ताज़ा खबर या अपडेट आएगा, वह यहाँ दिखाई देगा</p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 animate-slide-up">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-[#E21E26] flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                क्या आप वाकई हटाना चाहते हैं?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                आप {selectedIds.length} नोटिफिकेशन हटा रहे हैं। यह कार्रवाई वापस नहीं की जा सकती।
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  रद्द करें
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E21E26] text-white font-semibold hover:bg-[#c21a20] transition-colors"
                >
                  हटाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavbar />
    </div>
  );
}

export default NotificationPage;
