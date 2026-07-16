import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';
import socketService from '../services/socket';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  avatarUrl?: string;
  isVerified: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  bio?: string;
  consultationFee?: number;
  experienceYears?: number;
  rating?: number;
  specialties?: Array<{ id: string; name: string; description: string }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ isVerified: boolean }>;
  signup: (data: any) => Promise<any>;
  verifyOtp: (emailOrPhone: string, code: string) => Promise<void>;
  resendOtp: (emailOrPhone: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Connect to real-time websocket
          socketService.connect(storedToken);

          // Get fresh profile details asynchronously
          const profileData: any = await userAPI.getProfile();
          if (profileData && profileData.data) {
            const updatedUser = profileData.data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } catch (err: any) {
          console.error('Failed to restore auth session:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
    
    return () => {
      socketService.disconnect();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await authAPI.login({ email, password });
      
      // If login is successful but user is not verified, return status
      if (response.data && response.data.isVerified === false) {
        setIsLoading(false);
        return { isVerified: false };
      }

      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      
      // Connect to WebSocket
      socketService.connect(userToken);
      
      setIsLoading(false);
      return { isVerified: true };
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setIsLoading(false);
      throw err;
    }
  };

  const signup = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register({ ...data, role: 'DOCTOR' });
      setIsLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      setIsLoading(false);
      throw err;
    }
  };

  const verifyOtp = async (emailOrPhone: string, code: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response: any = await authAPI.verify({ emailOrPhone, code });
      const { token: userToken, user: userData } = response.data;
      
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(userToken);
      setUser(userData);
      
      // Connect to WebSocket
      socketService.connect(userToken);
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
      setIsLoading(false);
      throw err;
    }
  };

  const resendOtp = async (emailOrPhone: string) => {
    setError(null);
    try {
      await authAPI.resendOtp({ emailOrPhone });
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    socketService.disconnect();
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profileData: any = await userAPI.getProfile();
      if (profileData && profileData.data) {
        const updatedUser = profileData.data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
