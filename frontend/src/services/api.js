const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Auth API functions
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Failed to login');
  return response.json();
};

export const register = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) throw new Error('Failed to register');
  return response.json();
};

// Notification API functions
export const getNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to mark notification as read');
  return response.json();
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to mark all notifications as read');
  return response.json();
};

export const deleteNotification = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to delete notification');
  return response.json();
}; 