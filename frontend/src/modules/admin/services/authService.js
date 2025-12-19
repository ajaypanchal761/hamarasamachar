// Admin authentication service
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';
const ADMIN_SESSION_KEY = 'admin_session';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Login with username/email and password
  login: async (usernameOrEmail, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail,
          password,
          rememberMe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username/email or password');
      }

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store session
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(ADMIN_TOKEN_KEY, data.token);
      storage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
      storage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        token: data.token,
        adminId: data.admin.id,
        role: data.admin.role,
        loginTime: new Date().toISOString()
      }));

      return {
        token: data.token,
        admin: data.admin
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout
  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },
  
  // Get current admin (from storage, for quick access)
  getCurrentAdmin: () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const adminStr = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    
    if (!token || !adminStr) {
      return null;
    }
    
    try {
      return JSON.parse(adminStr);
    } catch (error) {
      authService.logout();
      return null;
    }
  },
  
  // Get token
  getToken: () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },
  
  // Check if admin is authenticated
  isAuthenticated: () => {
    const admin = authService.getCurrentAdmin();
    return admin !== null;
  },
  
  // Get current admin from API (for verification)
  getCurrentAdminFromAPI: async () => {
    const token = authService.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          authService.logout();
        }
        return null;
      }

      // Update stored admin data
      const storage = localStorage.getItem(ADMIN_TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));

      return data.admin;
    } catch (error) {
      console.error('Get current admin error:', error);
      return null;
    }
  },

  // Refresh session (verify token with API)
  refreshSession: async () => {
    try {
      const admin = await authService.getCurrentAdminFromAPI();
      return admin !== null;
    } catch (error) {
      return false;
    }
  },
  
  // Update admin profile
  updateProfile: async (updates) => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Update stored admin data
      const storage = localStorage.getItem(ADMIN_TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));

      return data.admin;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },
  
  // Change password
  changePassword: async (oldPassword, newPassword) => {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Forgot password - Send OTP to email
  forgotPassword: async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset OTP');
      }

      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp,
          newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
};

// Auto-refresh session on activity
let activityTimer = null;
let lastRefreshTime = 0;
let refreshInProgress = false;
const ACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes - periodic refresh only
const REFRESH_COOLDOWN = 5 * 60 * 1000; // 5 minutes - minimum time between refreshes

export const startActivityTracking = () => {
  // Stop any existing tracking first
  stopActivityTracking();
  
  // Only use periodic refresh - disable activity-based refresh to prevent resource exhaustion
  // Refresh session every 10 minutes if active (periodic check only)
  activityTimer = setInterval(() => {
    if (authService.isAuthenticated() && !refreshInProgress) {
      const now = Date.now();
      const timeSinceLastRefresh = now - lastRefreshTime;
      
      // Only refresh if cooldown has passed (5 minutes minimum)
      if (timeSinceLastRefresh >= REFRESH_COOLDOWN) {
        refreshInProgress = true;
        lastRefreshTime = now;
        
        authService.refreshSession()
          .catch(() => {
            // Silently handle errors - don't log to prevent console spam
          })
          .finally(() => {
            refreshInProgress = false;
          });
      }
    }
  }, ACTIVITY_TIMEOUT);
};

export const stopActivityTracking = () => {
  // Clear interval timer
  if (activityTimer) {
    clearInterval(activityTimer);
    activityTimer = null;
  }
  
  // Reset refresh state
  refreshInProgress = false;
  lastRefreshTime = 0;
};


