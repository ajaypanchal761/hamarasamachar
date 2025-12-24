import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../services/authService';

const UserAuthContext = createContext(null);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const userData = localStorage.getItem('userData');

        // If we have stored auth data, verify with API
        if (token && userData) {
          try {
            const verifiedUser = await getCurrentUser();
            if (verifiedUser) {
              setUser(verifiedUser);
            } else {
              // Token invalid, clear storage
              logout();
              setUser(null);
            }
          } catch (error) {
            // API call failed, clear storage
            logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Run checkAuth but don't block rendering
    checkAuth().catch(err => {
      console.error('User auth check failed:', err);
      setLoading(false);
    });
  }, []);

  const login = async (userData, token) => {
    try {
      // Store in localStorage
      localStorage.setItem('userToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      // Update state
      setUser(userData);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const userLogout = () => {
    logout();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout: userLogout,
    updateUser
  };

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within UserAuthProvider. Make sure UserAuthProvider wraps your component tree in App.jsx');
  }
  return context;
};
