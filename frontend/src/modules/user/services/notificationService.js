const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

export const getNotifications = async (page = 1, limit = 20, type, isRead) => {
  const token = localStorage.getItem('userToken');

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });

  if (type) params.append('type', type);
  if (isRead !== undefined) params.append('isRead', isRead);

  const response = await fetch(`${API_BASE_URL}/user/notifications?${params}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return await response.json();
};

export const markNotificationAsRead = async (notificationId) => {
  const token = localStorage.getItem('userToken');

  const response = await fetch(`${API_BASE_URL}/user/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return await response.json();
};

export const markAllNotificationsAsRead = async (type) => {
  const token = localStorage.getItem('userToken');

  const response = await fetch(`${API_BASE_URL}/user/notifications/mark-all-read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type })
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }

  return await response.json();
};

export const deleteNotification = async (notificationId) => {
  const token = localStorage.getItem('userToken');

  const response = await fetch(`${API_BASE_URL}/user/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }

  return await response.json();
};

export const getNotificationStats = async () => {
  const token = localStorage.getItem('userToken');

  const response = await fetch(`${API_BASE_URL}/user/notifications/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notification stats');
  }

  return await response.json();
};
