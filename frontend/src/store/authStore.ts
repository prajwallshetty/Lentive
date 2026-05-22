import { create } from 'zustand';
import { api } from '../lib/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  login: (email: string, password: string) => Promise<any>;
  signup: (data: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, data: any) => Promise<any>;
  verifyEmail: (token: string) => Promise<any>;
  resendVerification: () => Promise<any>;
  uploadDocument: (document: string) => Promise<any>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,

  refreshUser: async () => {
    set({ loading: true, error: null });
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, loading: false, initialized: true });
      return null;
    }

    try {
      const res = await api.auth.me();
      if (res.success) {
        set({ user: res.user, loading: false, initialized: true });
        return res.user;
      }
    } catch (err: any) {
      console.error('Session verification failed:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ user: null, loading: false, initialized: true });
    }
    return null;
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.auth.login({ email, password });
      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
        }
        set({ user: res.user, loading: false });
        return res;
      }
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  signup: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.auth.register(data);
      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
        }
        set({ user: res.user, loading: false });
        return res;
      }
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, loading: false });
  },

  forgotPassword: async (email) => {
    try {
      return await api.auth.forgotPassword(email);
    } catch (err: any) {
      throw err;
    }
  },

  resetPassword: async (token, data) => {
    set({ loading: true });
    try {
      const res = await api.auth.resetPassword(token, data);
      if (res.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', res.token);
        }
        set({ user: res.user, loading: false });
        return res;
      }
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  verifyEmail: async (token) => {
    try {
      const res = await api.auth.verifyEmail(token);
      if (res.success) {
        await get().refreshUser();
        return res;
      }
    } catch (err: any) {
      throw err;
    }
  },

  resendVerification: async () => {
    try {
      return await api.auth.resendVerification();
    } catch (err: any) {
      throw err;
    }
  },

  uploadDocument: async (document) => {
    set({ loading: true });
    try {
      const res = await api.auth.uploadDocument(document);
      if (res.success) {
        await get().refreshUser();
        return res;
      }
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  }
}));
