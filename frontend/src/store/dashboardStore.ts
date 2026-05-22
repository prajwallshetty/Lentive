import { create } from 'zustand';
import { api } from '../lib/api';
import { Notification } from '../types';

interface DashboardState {
  activeTab: string;
  notifications: Notification[];
  analytics: any | null;
  loading: boolean;
  error: string | null;

  setActiveTab: (tab: string) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  fetchAdminAnalytics: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  activeTab: 'overview',
  notifications: [],
  analytics: null,
  loading: false,
  error: null,

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  fetchNotifications: async () => {
    try {
      const res = await api.notifications.getAll();
      if (res.success) {
        set({ notifications: res.notifications });
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      const res = await api.notifications.markAsRead(id);
      if (res.success) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
        }));
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  },

  fetchAdminAnalytics: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.admin.getAnalytics();
      if (res.success) {
        set({ analytics: res.analytics, loading: false });
      } else {
        set({ error: 'Failed to fetch analytics', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching admin analytics', loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
