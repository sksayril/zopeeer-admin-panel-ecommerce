import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminApi, Admin, ChangePasswordRequest } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  changePassword: (passwordData: ChangePasswordRequest) => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('adminToken');
        const storedAdmin = localStorage.getItem('adminData');

        if (storedToken && storedAdmin) {
          setToken(storedToken);
          setAdmin(JSON.parse(storedAdmin));
          setIsAuthenticated(true);
          
          // Optionally verify token with server and refresh profile
          try {
            await refreshProfile();
          } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            setToken(null);
            setAdmin(null);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any corrupted data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await adminApi.login(email, password);
      
      if (response.success && response.data) {
        const { admin: adminData, token: authToken } = response.data;
        
        // Store in localStorage
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        // Update state
        setToken(authToken);
        setAdmin(adminData);
        setIsAuthenticated(true);
        
        toast.success(`Welcome back, ${adminData.name}!`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout API if token exists
      if (token) {
        try {
          await adminApi.logout();
        } catch (error) {
          // Even if API call fails, we should still logout locally
          console.warn('Logout API call failed:', error);
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      // Update state
      setToken(null);
      setAdmin(null);
      setIsAuthenticated(false);
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await adminApi.getProfile();
      if (response.success && response.data.admin) {
        const updatedAdmin = response.data.admin;
        setAdmin(updatedAdmin);
        localStorage.setItem('adminData', JSON.stringify(updatedAdmin));
      }
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      throw error;
    }
  };

  const changePassword = async (passwordData: ChangePasswordRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await adminApi.changePassword(passwordData);
      
      if (response.success) {
        toast.success('Password changed successfully');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Change password error:', error);
      toast.error(error.message || 'Failed to change password. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    admin,
    token,
    login,
    logout,
    refreshProfile,
    changePassword,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
