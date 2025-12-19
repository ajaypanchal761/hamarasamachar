import { createContext, useContext, useState, useEffect } from 'react';
import { authService, startActivityTracking, stopActivityTracking } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const checkAuth = async () => {
      try {
        const currentAdmin = authService.getCurrentAdmin();
        
        // If admin found in storage, verify with API
        if (currentAdmin) {
          try {
            const verifiedAdmin = await authService.getCurrentAdminFromAPI();
            if (verifiedAdmin) {
              setAdmin(verifiedAdmin);
              startActivityTracking();
            } else {
              // Token invalid, clear storage
              authService.logout();
              setAdmin(null);
            }
          } catch (error) {
            // API call failed, clear storage
            console.warn('Failed to verify admin token:', error);
            authService.logout();
            setAdmin(null);
          }
        } else {
          setAdmin(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    // Run checkAuth but don't block rendering
    checkAuth().catch(err => {
      console.error('Auth check failed:', err);
      setLoading(false);
    });

    return () => {
      stopActivityTracking();
    };
  }, []);

  const login = async (usernameOrEmail, password, rememberMe) => {
    try {
      const result = await authService.login(usernameOrEmail, password, rememberMe);
      setAdmin(result.admin);
      startActivityTracking();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setAdmin(null);
    stopActivityTracking();
  };

  const updateProfile = async (updates) => {
    try {
      const updatedAdmin = await authService.updateProfile(updates);
      setAdmin(updatedAdmin);
      return updatedAdmin;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated: !!admin,
    login,
    logout,
    updateProfile
  };

  // Always render children - don't block rendering even if auth check fails
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider. Make sure AuthProvider wraps your component tree in App.jsx');
  }
  return context;
};

