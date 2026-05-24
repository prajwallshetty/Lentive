import { create } from 'zustand';
import { api } from '../lib/api';
import { Listing } from '../types';

interface ListingFilters {
  category: string;
  query: string;
  distance: number; // in km
  coordinates: [number, number]; // [lng, lat]
  minPrice: number;
  maxPrice: number;
}

interface ListingState {
  listings: Listing[];
  myListings: Listing[];
  loading: boolean;
  error: string | null;
  filters: ListingFilters;

  setFilters: (filters: Partial<ListingFilters>) => void;
  resetFilters: () => void;
  fetchListings: () => Promise<void>;
  fetchMyListings: () => Promise<void>;
  createListing: (data: any) => Promise<Listing>;
  updateListing: (id: string, data: any) => Promise<Listing>;
  deleteListing: (id: string) => Promise<void>;
}

const defaultFilters: ListingFilters = {
  category: 'All',
  query: '',
  distance: 10, // 10 km default radius
  coordinates: [77.6412, 12.9719], // Default Indiranagar, Bengaluru [lng, lat]
  minPrice: 0,
  maxPrice: 50000,
};

let fetchTimeout: any = null;

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  myListings: [],
  loading: false,
  error: null,
  filters: defaultFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));

    const shouldDebounce = 'query' in newFilters || 'minPrice' in newFilters || 'maxPrice' in newFilters;

    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
      fetchTimeout = null;
    }

    if (shouldDebounce) {
      fetchTimeout = setTimeout(() => {
        get().fetchListings();
      }, 450); // 450ms debounce for typing
    } else {
      get().fetchListings();
    }
  },

  resetFilters: () => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
      fetchTimeout = null;
    }
    set({ filters: defaultFilters });
    get().fetchListings();
  },

  fetchListings: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const res = await api.listings.getAll({
        lng: filters.coordinates[0],
        lat: filters.coordinates[1],
        distance: filters.distance,
        category: filters.category,
        query: filters.query,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < 50000 ? filters.maxPrice : undefined,
      });
      if (res.success) {
        set({ listings: res.listings, loading: false });
      } else {
        set({ error: 'Failed to fetch listings', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching listings', loading: false });
    }
  },

  fetchMyListings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.listings.getMy();
      if (res.success) {
        set({ myListings: res.listings, loading: false });
      } else {
        set({ error: 'Failed to fetch my listings', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching your listings', loading: false });
    }
  },

  createListing: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.listings.create(data);
      if (res.success) {
        set({ loading: false });
        get().fetchMyListings(); // Refresh own listings
        get().fetchListings(); // Refresh main search listings
        return res.listing;
      } else {
        throw new Error(res.error || 'Failed to create listing');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error creating listing', loading: false });
      throw err;
    }
  },

  updateListing: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await api.listings.update(id, data);
      if (res.success) {
        set({ loading: false });
        get().fetchMyListings();
        get().fetchListings();
        return res.listing;
      } else {
        throw new Error(res.error || 'Failed to update listing');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error updating listing', loading: false });
      throw err;
    }
  },

  deleteListing: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.listings.delete(id);
      if (res.success) {
        set((state) => ({
          myListings: state.myListings.filter((l) => l._id !== id),
          listings: state.listings.filter((l) => l._id !== id),
          loading: false,
        }));
      } else {
        throw new Error(res.error || 'Failed to delete listing');
      }
    } catch (err: any) {
      set({ error: err.message || 'Error deleting listing', loading: false });
      throw err;
    }
  },
}));
