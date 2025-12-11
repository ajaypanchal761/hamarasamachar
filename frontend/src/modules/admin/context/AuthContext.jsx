import { createContext, useContext, useState, useEffect } from 'react';
import { authService, startActivityTracking, stopActivityTracking } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const currentAdmin = authService.getCurrentAdmin();
    setAdmin(currentAdmin);
    setLoading(false);

    if (currentAdmin) {
      startActivityTracking();
    }

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

