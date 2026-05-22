import { create } from 'zustand';
import { api } from '../lib/api';
import { Booking } from '../types';

interface BookingState {
  renterBookings: Booking[];
  ownerBookings: Booking[];
  loading: boolean;
  error: string | null;

  fetchRenterBookings: () => Promise<void>;
  fetchOwnerBookings: () => Promise<void>;
  createBooking: (data: { listingId: string; startDate: string; endDate: string; paymentId?: string; paymentStatus?: string }) => Promise<Booking>;
  acceptBooking: (id: string) => Promise<void>;
  rejectBooking: (id: string) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  updateBookingStatus: (id: string, status: 'pending' | 'accepted' | 'rejected' | 'active' | 'completed' | 'cancelled') => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  renterBookings: [],
  ownerBookings: [],
  loading: false,
  error: null,

  fetchRenterBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.getRenterBookings();
      if (res.success) {
        set({ renterBookings: res.bookings, loading: false });
      } else {
        set({ error: 'Failed to fetch renter bookings', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching renter bookings', loading: false });
    }
  },

  fetchOwnerBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.getOwnerBookings();
      if (res.success) {
        set({ ownerBookings: res.bookings, loading: false });
      } else {
        set({ error: 'Failed to fetch owner bookings', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching owner bookings', loading: false });
    }
  },

  createBooking: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.create(data);
      if (res.success) {
        set({ loading: false });
        get().fetchRenterBookings();
        return res.booking;
      } else {
        throw new Error(res.error || 'Failed to create booking');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error creating booking', loading: false });
      throw err;
    }
  },

  acceptBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.accept(id);
      if (res.success) {
        set({ loading: false });
        get().fetchOwnerBookings();
      } else {
        throw new Error(res.error || 'Failed to accept booking');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error accepting booking', loading: false });
      throw err;
    }
  },

  rejectBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.reject(id);
      if (res.success) {
        set({ loading: false });
        get().fetchOwnerBookings();
      } else {
        throw new Error(res.error || 'Failed to reject booking');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error rejecting booking', loading: false });
      throw err;
    }
  },

  cancelBooking: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.cancel(id);
      if (res.success) {
        set({ loading: false });
        get().fetchRenterBookings();
        get().fetchOwnerBookings();
      } else {
        throw new Error(res.error || 'Failed to cancel booking');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error cancelling booking', loading: false });
      throw err;
    }
  },

  updateBookingStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await api.bookings.updateStatus(id, status);
      if (res.success) {
        set({ loading: false });
        get().fetchRenterBookings();
        get().fetchOwnerBookings();
      } else {
        throw new Error(res.error || 'Failed to update booking status');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error updating booking status', loading: false });
      throw err;
    }
  },
}));
