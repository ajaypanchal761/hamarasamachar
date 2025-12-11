// Admin authentication service
const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';
const ADMIN_SESSION_KEY = 'admin_session';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

// Dummy admin credentials (replace with API call later)
const DUMMY_ADMINS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@hamarasamachar.com',
    password: '123', // In production, this should be hashed
    role: 'admin',
    name: 'Admin User',
    phone: '+911234567890'
  },
  {
    id: 2,
    username: 'superadmin',
    email: 'superadmin@hamarasamachar.com',
    password: 'superadmin123',
    role: 'super_admin',
    name: 'Super Admin',
    phone: '+911234567891'
  }
];

export const authService = {
  // Login with username/email and password
  login: async (usernameOrEmail, password, rememberMe = false) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find admin by username or email
    const admin = DUMMY_ADMINS.find(
      a => (a.username === usernameOrEmail || a.email === usernameOrEmail) && 
           a.password === password
    );
    
    if (!admin) {
      throw new Error('Invalid username/email or password');
    }
    
    // Generate token (in production, this should come from API)
    const token = `admin_token_${admin.id}_${Date.now()}`;
    const sessionData = {
      token,
      adminId: admin.id,
      role: admin.role,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString()
    };
    
    // Store session
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(ADMIN_TOKEN_KEY, token);
    storage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
    storage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    
    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        phone: admin.phone
      }
    };
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
  
  // Get current admin
  getCurrentAdmin: () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const adminStr = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    const sessionStr = localStorage.getItem(ADMIN_SESSION_KEY) || sessionStorage.getItem(ADMIN_SESSION_KEY);
    
    if (!token || !adminStr || !sessionStr) {
      return null;
    }
    
    try {
      const session = JSON.parse(sessionStr);
      const expiresAt = new Date(session.expiresAt);
      
      // Check if session expired
      if (new Date() > expiresAt) {
        authService.logout();
        return null;
      }
      
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
  
  // Refresh session
  refreshSession: () => {
    const admin = authService.getCurrentAdmin();
    if (!admin) return false;
    
    const sessionData = {
      token: authService.getToken(),
      adminId: admin.id,
      role: admin.role,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT).toISOString()
    };
    
    const storage = localStorage.getItem(ADMIN_TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
    
    return true;
  },
  
  // Update admin profile
  updateProfile: async (updates) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const admin = authService.getCurrentAdmin();
    if (!admin) {
      throw new Error('Not authenticated');
    }
    
    const updatedAdmin = { ...admin, ...updates };
    const storage = localStorage.getItem(ADMIN_TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(ADMIN_USER_KEY, JSON.stringify(updatedAdmin));
    
    return updatedAdmin;
  },
  
  // Change password
  changePassword: async (oldPassword, newPassword) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const admin = authService.getCurrentAdmin();
    if (!admin) {
      throw new Error('Not authenticated');
    }
    
    // In production, verify old password with API
    // For now, just update (in real app, this should be hashed)
    return true;
  }
};

// Auto-refresh session on activity
let activityTimer = null;
const ACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export const startActivityTracking = () => {
  if (activityTimer) {
    clearInterval(activityTimer);
  }
  
  const handleActivity = () => {
    if (authService.isAuthenticated()) {
      authService.refreshSession();
    }
  };
  
  // Track user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, handleActivity, { passive: true });
  });
  
  // Refresh session every 5 minutes if active
  activityTimer = setInterval(() => {
    if (authService.isAuthenticated()) {
      authService.refreshSession();
    }
  }, ACTIVITY_TIMEOUT);
};

export const stopActivityTracking = () => {
  if (activityTimer) {
    clearInterval(activityTimer);
    activityTimer = null;
  }
};

