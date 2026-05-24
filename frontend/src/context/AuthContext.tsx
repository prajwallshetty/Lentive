'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useToast } from './ToastContext';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (data: any) => Promise<any>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, data: any) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: () => Promise<any>;
  refreshUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.auth.me();
      if (res.success) {
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  // Fetch session on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Keep useAuthStore and AuthContext in sync (bidirectional)
  useEffect(() => {
    useAuthStore.setState({ user, loading, initialized: !loading });
  }, [user, loading]);

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state) => {
      setUser((currentVal: any) => {
        if (JSON.stringify(currentVal) !== JSON.stringify(state.user)) {
          return state.user;
        }
        return currentVal;
      });
      setLoading((currentVal) => {
        if (currentVal !== state.loading) {
          return state.loading;
        }
        return currentVal;
      });
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !useAuthStore.getState().user) {
      useAuthStore.getState().refreshUser();
    }

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      throw err;
    }
  };

  const signup = async (data: any) => {
    try {
      const res = await api.auth.register(data);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        showToast('Registration successful! Please check your email inbox to verify your account.', 'success');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const forgotPassword = async (email: string) => {
    try {
      const res = await api.auth.forgotPassword(email);
      if (res.success) {
        showToast('Password reset link sent! Check your inbox.', 'success');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to send reset link.', 'error');
      throw err;
    }
  };

  const resetPassword = async (token: string, data: any) => {
    try {
      const res = await api.auth.resetPassword(token, data);
      if (res.success) {
        localStorage.setItem('token', res.token);
        setUser(res.user);
        showToast('Password reset successful! You are now logged in.', 'success');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password.', 'error');
      throw err;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const res = await api.auth.verifyEmail(token);
      if (res.success) {
        showToast('Email verified successfully!', 'success');
        await refreshUser(); // Update state to user.isVerified = true
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Email verification failed.', 'error');
      throw err;
    }
  };

  const resendVerification = async () => {
    try {
      const res = await api.auth.resendVerification();
      if (res.success) {
        showToast('Verification email resent successfully.', 'success');
        return res;
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to resend verification.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
