import { create } from 'zustand';
import { api } from '../lib/api';

export interface Transaction {
  _id: string;
  bookingId: any;
  userId: any;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  type: 'booking' | 'deposit' | 'refund';
  status: 'pending' | 'captured' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  fetchHistory: () => Promise<void>;
  createOrder: (bookingId: string) => Promise<any>;
  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    bookingId: string;
  }) => Promise<any>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.payments.getHistory();
      if (res.success) {
        set({ transactions: res.payments, loading: false });
      } else {
        set({ error: 'Failed to fetch transaction history', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching transactions', loading: false });
    }
  },

  createOrder: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.payments.createOrder(bookingId);
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || 'Error creating payment order', loading: false });
      throw err;
    }
  },

  verifyPayment: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.payments.verifyPayment(data);
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || 'Error verifying payment', loading: false });
      throw err;
    }
  },
}));
