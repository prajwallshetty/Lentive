'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { MockLocation } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import { 
  Plus, DollarSign, Package, ShoppingBag, 
  CheckCircle2, Clock, Calendar, PlusCircle,
  Pencil, Trash2, Star, X, Upload, AlertCircle,
  Bell, User, ShieldCheck, RefreshCw, XCircle, Play
} from 'lucide-react';

interface DashboardViewProps {
  user: any;
  currentLocation: MockLocation;
  initialShowAddForm?: boolean;
  onCloseAddForm?: () => void;
  initialTab?: 'overview' | 'listings' | 'requests' | 'rentals';
  onStatsUpdate?: (unread: number, pending: number) => void;
  onTabChange?: (tab: 'overview' | 'listings' | 'requests' | 'rentals') => void;
}

export default function DashboardView({ 
  user, 
  currentLocation,
  initialShowAddForm,
  onCloseAddForm,
  initialTab,
  onStatsUpdate,
  onTabChange
}: DashboardViewProps) {
  const { showToast } = useToast();
  
  // Tabs: overview | listings | requests (hosting requests) | rentals (renting history)
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'requests' | 'rentals'>(initialTab || 'overview');

  // Sync activeTab with initialTab prop
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: 'overview' | 'listings' | 'requests' | 'rentals') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };
  
  const [listings, setListings] = useState<any[]>([]);
  const [renterBookings, setRenterBookings] = useState<any[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Listing form state
  const [showAddForm, setShowAddForm] = useState(initialShowAddForm || false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Tools');
  const [formPrice, setFormPrice] = useState(15);
  const [formDeposit, setFormDeposit] = useState(50);
  const [formAddress, setFormAddress] = useState(currentLocation.address);
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Review submission state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewListingId, setReviewListingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Parallel loading of Listings, Renter Bookings, Owner Bookings and Notifications
      const [listingsRes, renterRes, ownerRes, notificationsRes] = await Promise.all([
        api.listings.getAll(),
        api.bookings.getRenterBookings(),
        api.bookings.getOwnerBookings(),
        api.notifications.getAll().catch(() => ({ notifications: [] })) // Graceful handling if backend notification api isn't ready immediately
      ]);

      // Filter listings belonging to current user
      const myItems = (listingsRes.listings || []).filter(
        (item: any) => item.owner?._id === user.id || item.owner === user.id
      );
      setListings(myItems);

      // Bookings renter made
      setRenterBookings(renterRes.bookings || renterRes.data || []);
      
      // Bookings owner received
      setOwnerBookings(ownerRes.bookings || ownerRes.data || []);

      // Notifications
      setNotifications(notificationsRes.notifications || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Error loading dashboard console data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Sync address form when user location context changes
  useEffect(() => {
    if (!editingListingId) {
      setFormAddress(currentLocation.address);
    }
  }, [currentLocation, editingListingId]);

  // Trigger form opening when navigated from FAB
  useEffect(() => {
    if (initialShowAddForm) {
      setEditingListingId(null);
      setShowAddForm(true);
      handleTabChange('listings');
      if (onCloseAddForm) {
        onCloseAddForm();
      }
    }
  }, [initialShowAddForm]);

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select an image under 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingListingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Tools');
    setFormPrice(15);
    setFormDeposit(50);
    setFormImage('');
    setFormAddress(currentLocation.address);
    setFormError('');
    setFormSuccess(false);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formTitle || !formDescription || !formAddress) {
      setFormError('Please fill out all required fields.');
      return;
    }

    try {
      const defaultImages = formImage ? [formImage] : [
        formCategory === 'Tools' ? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Electronics' ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Vehicles' ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Outdoor' ? 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Party Supplies' ? 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Fashion' ? 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' :
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
      ];

      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        pricePerDay: Number(formPrice),
        securityDeposit: Number(formDeposit),
        images: defaultImages,
        address: formAddress,
        coordinates: listings.find(l => l._id === editingListingId)?.coordinates || currentLocation.coordinates
      };

      if (editingListingId) {
        await api.listings.update(editingListingId, payload);
        showToast('Listing updated successfully!', 'success');
      } else {
        await api.listings.create(payload);
        showToast('Listing created successfully!', 'success');
      }

      setFormSuccess(true);
      
      setTimeout(() => {
        handleCloseForm();
        fetchDashboardData();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing.');
      showToast(err.message || 'Failed to save listing.', 'error');
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await api.listings.delete(id);
      showToast('Listing deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  // Actions for bookings
  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await api.bookings.accept(bookingId);
      showToast('Booking request accepted successfully!', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept booking request.', 'error');
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking request?')) return;
    try {
      await api.bookings.reject(bookingId);
      showToast('Booking request rejected.', 'info');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject booking request.', 'error');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will notify the other party.')) return;
    try {
      await api.bookings.cancel(bookingId);
      showToast('Booking cancelled successfully.', 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'active' | 'completed') => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      showToast(`Booking marked as ${status}.`, 'success');
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setReviewListingId(booking.listing?._id || booking.listingId?._id || booking.listing);
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    if (!reviewListingId) {
      setReviewError('Listing ID is missing.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please provide a comment.');
      return;
    }

    try {
      await api.reviews.create(reviewListingId, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess(true);
      showToast('Review submitted successfully!', 'success');
      
      setTimeout(() => {
        setShowReviewModal(false);
        fetchDashboardData();
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
      showToast(err.message || 'Failed to submit review.', 'error');
    }
  };

  // Stats Aggregations
  // 1. Total Earnings from listings: accepted, active, completed bookings
  const acceptedOwnerBookings = ownerBookings.filter(b => 
    ['accepted', 'active', 'completed'].includes(b.status || b.bookingStatus)
  );
  const totalEarnings = acceptedOwnerBookings.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);

  // 2. Incoming Pending Requests Count
  const pendingRequestsCount = ownerBookings.filter(b => (b.status || b.bookingStatus) === 'pending').length;

  // 3. Active Rentals Count (either renting or lending)
  const activeRentalsCount = renterBookings.filter(b => (b.status || b.bookingStatus) === 'active').length + 
                             ownerBookings.filter(b => (b.status || b.bookingStatus) === 'active').length;

  // 4. Unread Notifications Count
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Sync stats badge counts back to parent page component
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(unreadNotificationsCount, pendingRequestsCount);
    }
  }, [unreadNotificationsCount, pendingRequestsCount, onStatsUpdate]);

  // Status Chip Rendering Helper
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let classes = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    let label = 'Unknown';

    if (s === 'pending') {
      classes = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      label = 'Pending Approval';
    } else if (s === 'accepted') {
      classes = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
      label = 'Confirmed';
    } else if (s === 'rejected') {
      classes = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      label = 'Rejected';
    } else if (s === 'active') {
      classes = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20 animate-pulse';
      label = 'Active Rental';
    } else if (s === 'completed') {
      classes = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
      label = 'Completed';
    } else if (s === 'cancelled') {
      classes = 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/10';
      label = 'Cancelled';
    }

    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${classes}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="w-full py-6 animate-in fade-in duration-300 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary/[0.03] via-card to-card p-6 md:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm mb-6">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              Marketplace Dashboard
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5">
              Welcome back, <span className="font-bold text-primary">{user.name}</span>. Track your listings, bookings, and earnings.
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              title="Refresh Dashboard"
              className="p-2.5 bg-white dark:bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/30 rounded-xl transition active:scale-95 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setEditingListingId(null);
                setShowAddForm(true);
              }}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-[#005c3e] text-white text-xs font-extrabold rounded-xl border border-primary/10 transition-all duration-200 cursor-pointer shadow-sm active:scale-95 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
              <Plus className="h-4 w-4" />
              List an Item
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 bg-muted dark:bg-black/10 border border-border/40 p-1 rounded-xl my-6 w-fit overflow-x-auto hide-scrollbar">
          <button
            onClick={() => handleTabChange('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview' 
                ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
            }`}
          >
            Overview
            {unreadNotificationsCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('listings')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'listings' 
                ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
            }`}
          >
            My Listings ({listings.length})
          </button>
          <button
            onClick={() => handleTabChange('requests')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'requests' 
                ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
            }`}
          >
            Booking Requests
            {pendingRequestsCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('rentals')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'rentals' 
                ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
            }`}
          >
            My Rentals ({renterBookings.length})
          </button>
        </div>

        {/* Dashboard Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-xs font-semibold">Loading marketplace console...</p>
          </div>
        )}

        {/* Overview Tab Content */}
        {!loading && activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Stats Panel - Left 2 columns */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Stat Cards Row */}
              <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-3 md:pb-0 hide-scrollbar snap-x snap-mandatory">
                {/* Total Earnings */}
                <div className="min-w-[260px] md:min-w-0 flex-1 shrink-0 md:shrink md:flex-initial snap-start relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Total Earnings</p>
                    <p className="text-xl font-black text-foreground mt-0.5">{formatCurrency(totalEarnings)}</p>
                  </div>
                </div>

                {/* My Listed Items */}
                <div className="min-w-[260px] md:min-w-0 flex-1 shrink-0 md:shrink md:flex-initial snap-start relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">My Listed Items</p>
                    <p className="text-xl font-black text-foreground mt-0.5">{listings.length}</p>
                  </div>
                </div>

                {/* Active Bookings (Both) */}
                <div className="min-w-[260px] md:min-w-0 flex-1 shrink-0 md:shrink md:flex-initial snap-start relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Active Rentals</p>
                    <p className="text-xl font-black text-foreground mt-0.5">{activeRentalsCount}</p>
                  </div>
                </div>
              </div>

              {/* Quick Status / Calendar list */}
              <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="text-base font-extrabold text-foreground border-b border-border/40 pb-3 mb-4 flex items-center justify-between">
                  <span>Active & Upcoming Rentals</span>
                  <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 font-bold px-2 py-0.5 rounded-full">
                    Unified Tracker
                  </span>
                </h3>

                {/* List combined bookings that are accepted or active */}
                {(() => {
                  const activeRentalsList = [
                    ...renterBookings.map(b => ({ ...b, role: 'renter' })),
                    ...ownerBookings.map(b => ({ ...b, role: 'owner' }))
                  ].filter(b => ['accepted', 'active'].includes((b.status || b.bookingStatus || '').toLowerCase()));

                  if (activeRentalsList.length === 0) {
                    return (
                      <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 mb-1">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <h4 className="font-bold text-xs text-foreground">No Active Rentals</h4>
                        <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
                          You don't have any active handovers or confirmed rentals currently.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col gap-3">
                      {activeRentalsList.map((b) => (
                        <div key={b._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <img
                              src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'}
                              alt=""
                              className="h-10 w-10 rounded-lg object-cover border border-border/20 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{b.listing?.title}</p>
                                <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                                  b.role === 'renter' 
                                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                }`}>
                                  {b.role === 'renter' ? 'Renting' : 'Lending'}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {b.role === 'renter' ? `Owner: ${b.owner?.name}` : `Renter: ${b.renter?.name}`} • {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                            <div className="text-xs">
                              <p className="font-extrabold text-foreground">{formatCurrency(b.totalPrice || b.totalAmount)}</p>
                              <p className="text-[9px] text-muted-foreground">{b.totalDays || Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24))} days</p>
                            </div>
                            {renderStatusBadge(b.status || b.bookingStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Notification Center Panel - Right 1 Column */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm h-fit">
              <h3 className="text-base font-extrabold text-foreground border-b border-border/40 pb-3 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Bell className="h-4.5 w-4.5 text-primary shrink-0" />
                  Live Notifications
                </span>
                {unreadNotificationsCount > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shrink-0">
                    {unreadNotificationsCount} New
                  </span>
                )}
              </h3>

              {notifications.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/40 border border-primary/10 mb-1">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-xs text-foreground">All Caught Up</h4>
                  <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed">
                    No new activity notifications at the moment.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1 hide-scrollbar">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => !n.isRead && handleMarkNotificationRead(n._id)}
                      className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col gap-1.5 ${
                        n.isRead 
                          ? 'bg-muted/10 border-border/20 text-muted-foreground' 
                          : 'bg-primary/5 border-primary/20 text-foreground hover:bg-primary/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 text-[11px]">
                        <p className={`font-semibold leading-relaxed ${!n.isRead ? 'font-bold' : ''}`}>
                          {n.message}
                        </p>
                        {!n.isRead && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-[9px] text-muted-foreground font-semibold">
                        <span>{new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!n.isRead && (
                          <button 
                            type="button" 
                            className="text-primary hover:underline"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Listings Tab Content */}
        {!loading && activeTab === 'listings' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-foreground">My Listed Items</h3>
              <span className="text-xs text-muted-foreground font-semibold">Total: {listings.length} items</span>
            </div>

            {listings.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 mb-1 animate-pulse">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-extrabold text-sm text-foreground">No Items Listed Yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Turn your idle cameras, tools, or bikes into extra income by listing them in your community.
                </p>
                <button
                  onClick={() => {
                    setEditingListingId(null);
                    setShowAddForm(true);
                  }}
                  className="mt-2 px-4 py-2 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                >
                  List Your First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {listings.map((item) => (
                  <div key={item._id} className="rounded-xl border border-border/30 p-3.5 bg-muted/20 hover:border-primary/35 hover:bg-muted/40 flex flex-col justify-between gap-3.5 transition-all duration-300 group shadow-sm">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/20 shrink-0 bg-muted">
                        <img 
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col justify-between overflow-hidden">
                        <div>
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.category}</p>
                        </div>
                        <p className="text-sm font-extrabold text-primary mt-1">
                          {formatCurrency(item.pricePerDay)}<span className="text-[10px] text-muted-foreground font-bold">/day</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-1 text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                        item.isAvailable 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' 
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                      }`}>
                        {item.isAvailable ? 'Listed Available' : 'Inactive / Booked'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingListingId(item._id);
                            setFormTitle(item.title);
                            setFormDescription(item.description);
                            setFormCategory(item.category);
                            setFormPrice(item.pricePerDay);
                            setFormDeposit(item.securityDeposit);
                            setFormAddress(item.address || currentLocation.address);
                            setFormImage(item.images?.[0] || '');
                            setShowAddForm(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <Pencil className="h-3 w-3 text-primary" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:border-rose-500/30 border border-rose-500/15 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Requests Tab (Lender console) */}
        {!loading && activeTab === 'requests' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-foreground">Manage Incoming Booking Requests</h3>
              <span className="text-xs text-muted-foreground font-semibold">Total Requests: {ownerBookings.length}</span>
            </div>

            {ownerBookings.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 mb-1">
                  <Clock className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-extrabold text-sm text-foreground">No Requests Yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  When other users request to rent your listed items, they will show up here for you to accept or reject.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {ownerBookings.map((b) => {
                  const status = (b.status || b.bookingStatus || '').toLowerCase();
                  return (
                    <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:border-primary/25 hover:bg-muted/40 md:flex-row md:items-center transition-all duration-300">
                      
                      {/* Left: Listing & Renter Profile details */}
                      <div className="flex items-start gap-4">
                        <img 
                          src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="h-12 w-12 rounded-lg object-cover border border-border/20 shrink-0 bg-muted"
                        />
                        <div>
                          <p className="text-sm font-extrabold text-foreground">{b.listing?.title}</p>
                          
                          {/* Renter Profile details */}
                          <div className="flex items-center gap-2 mt-1 bg-white/50 dark:bg-black/10 px-2.5 py-1 rounded-lg border border-border/30 w-fit">
                            <img
                              src={b.renter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                              alt=""
                              className="h-4.5 w-4.5 rounded-full object-cover border border-border/20 shrink-0"
                            />
                            <p className="text-[10px] font-semibold text-muted-foreground leading-none">
                              Renter: <span className="font-bold text-foreground">{b.renter?.name}</span> ({b.renter?.email})
                            </p>
                          </div>

                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5 font-semibold">
                            <Calendar className="h-3 w-3 text-primary shrink-0" />
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right: Pricing and Action buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-border/20 pt-3 md:border-t-0 md:pt-0">
                        <div className="text-xs md:text-right font-semibold">
                          <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice || b.totalAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit || b.depositAmount)} (Escrow)</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                          {status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(b._id)}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white hover:brightness-110 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5 min-h-[40px] hover:scale-[1.02]"
                              >
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(b._id)}
                                className="px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 min-h-[40px] hover:scale-[1.02]"
                              >
                                <XCircle className="h-4 w-4 shrink-0" />
                                Reject
                              </button>
                            </>
                          )}

                          {status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'active')}
                              className="px-5 py-2.5 bg-indigo-600 text-white hover:brightness-110 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 min-h-[40px] shadow-md shadow-indigo-600/20 hover:scale-[1.02]"
                            >
                              <Play className="h-4 w-4 fill-white shrink-0" />
                              Handover (Start)
                            </button>
                          )}

                          {status === 'active' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                              className="px-5 py-2.5 bg-primary text-white hover:brightness-110 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 min-h-[40px] shadow-md shadow-primary/20 hover:scale-[1.02]"
                            >
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Complete Rental
                            </button>
                          )}

                          {['rejected', 'completed', 'cancelled'].includes(status) && (
                            renderStatusBadge(b.status || b.bookingStatus)
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Rentals Tab (Renter console) */}
        {!loading && activeTab === 'rentals' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-foreground">My Outgoing Rentals</h3>
              <span className="text-xs text-muted-foreground font-semibold">Total Bookings: {renterBookings.length}</span>
            </div>

            {renterBookings.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 mb-1">
                  <ShoppingBag className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-extrabold text-sm text-foreground">No Rentals Yet</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Explore available items nearby and request a booking to start renting gear.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
                >
                  Browse Local Items
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {renterBookings.map((b) => {
                  const status = (b.status || b.bookingStatus || '').toLowerCase();
                  return (
                    <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:border-primary/25 hover:bg-muted/40 md:flex-row md:items-center transition-all duration-300">
                      
                      {/* Left side details */}
                      <div className="flex items-start gap-4">
                        <img 
                          src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="h-12 w-12 rounded-lg object-cover border border-border/20 shrink-0 bg-muted"
                        />
                        <div>
                          <p className="text-sm font-extrabold text-foreground">{b.listing?.title}</p>
                          
                          {/* Owner Profile details */}
                          <div className="flex items-center gap-2 mt-1 bg-white/50 dark:bg-black/10 px-2.5 py-1 rounded-lg border border-border/30 w-fit">
                            <img
                              src={b.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                              alt=""
                              className="h-4.5 w-4.5 rounded-full object-cover border border-border/20 shrink-0"
                            />
                            <p className="text-[10px] font-semibold text-muted-foreground leading-none">
                              Owner: <span className="font-bold text-foreground">{b.owner?.name}</span> ({b.owner?.email})
                            </p>
                          </div>

                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5 font-semibold">
                            <Calendar className="h-3 w-3 text-primary shrink-0" />
                            {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Right side pricing & actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-border/20 pt-3 md:border-t-0 md:pt-0">
                        <div className="text-xs md:text-right font-semibold">
                          <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice || b.totalAmount)}</p>
                          <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit || b.depositAmount)}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-end">
                          {/* Cancellation allowed for pending or accepted requests */}
                          {['pending', 'accepted'].includes(status) && (
                            <button
                              onClick={() => handleCancelBooking(b._id)}
                              className="px-5 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 min-h-[40px] hover:scale-[1.02]"
                            >
                              <XCircle className="h-4 w-4 shrink-0" />
                              Cancel Request
                            </button>
                          )}

                          {status === 'completed' && (
                            <button
                              onClick={() => handleOpenReviewModal(b)}
                              className="px-5 py-2.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/35 active:scale-95 text-xs font-black tracking-wide rounded-full transition-all duration-200 cursor-pointer hover:scale-[1.02] flex items-center gap-1.5 min-h-[40px]"
                            >
                              <Star className="h-4 w-4 fill-amber-500 text-amber-500 shrink-0" />
                              Write Review
                            </button>
                          )}

                          {status !== 'completed' && !['pending', 'accepted'].includes(status) && (
                            renderStatusBadge(b.status || b.bookingStatus)
                          )}
                          {['pending', 'accepted'].includes(status) && (
                            renderStatusBadge(b.status || b.bookingStatus)
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Listing Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs bottom-sheet-overlay">
          <div className="relative w-full md:max-w-lg max-h-[92vh] md:max-h-[95vh] overflow-y-auto rounded-t-[28px] md:rounded-2xl bg-card border-t md:border border-border/40 p-6 shadow-2xl bottom-sheet-content md:animate-in md:zoom-in-95 md:duration-200 hide-scrollbar">
            
            {/* Mobile drag handle */}
            <div className="block md:hidden drag-handle" />

            <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/40 pb-3 mt-2 md:mt-0">
              {editingListingId ? 'Edit Listed Item' : 'List a New Item'}
            </h3>
            <button
              onClick={handleCloseForm}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {formSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg text-foreground">{editingListingId ? 'Item Updated!' : 'Item Listed!'}</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  {editingListingId ? 'Your item changes have been saved.' : 'Item was listed successfully at your simulated location!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateListing} className="flex flex-col gap-4 mt-4 text-xs font-semibold text-foreground">
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Item Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Cordless Lawn Mower"
                    className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="rounded-xl border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
                    >
                      <option>Tools</option>
                      <option>Electronics</option>
                      <option>Vehicles</option>
                      <option>Outdoor</option>
                      <option>Party Supplies</option>
                      <option>Fashion</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Address / Location</label>
                    <input
                      type="text"
                      required
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Price / Day ($)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Security Deposit ($)</label>
                    <input
                      type="number"
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide condition, features, and pickup instructions..."
                    rows={3}
                    className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Item Image</label>
                  <div className="flex flex-col gap-2">
                    {formImage && (
                      <div className="relative h-28 w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
                        <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImage('')}
                          className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white rounded-full p-1.5 hover:text-rose-400 transition cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      className="flex flex-col items-center justify-center border border-dashed border-border/60 hover:border-primary/60 rounded-xl p-4.5 cursor-pointer transition-all duration-200 bg-muted/20 hover:bg-muted/40"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFile(file);
                        }}
                        className="hidden"
                        id="image-file-input"
                      />
                      <label htmlFor="image-file-input" className="cursor-pointer flex flex-col items-center text-center w-full">
                        <Upload className="h-5 w-5 text-primary mb-1.5" />
                        <span className="text-[11px] text-muted-foreground">
                          Drag & drop or <span className="text-primary font-bold hover:underline">browse</span> image file
                        </span>
                        <span className="text-[9px] text-muted-foreground/60 mt-0.5">Supports PNG, JPG, GIF up to 5MB</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10">
                  <PlusCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                    This item will be listed at coordinates <span className="font-semibold text-foreground">[{currentLocation.coordinates.join(', ')}]</span> corresponding to your current simulated location, enabling hyperlocal discovery.
                  </p>
                </div>

                {formError && (
                  <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[10px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 mt-2"
                >
                  {editingListingId ? 'Save Changes' : 'Confirm Listing'}
                </button>

              </form>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs bottom-sheet-overlay">
          <div className="relative w-full md:max-w-md max-h-[92vh] md:max-h-[95vh] overflow-y-auto rounded-t-[28px] md:rounded-2xl bg-card border-t md:border border-border/40 p-6 shadow-2xl bottom-sheet-content md:animate-in md:zoom-in-95 md:duration-200 hide-scrollbar">
            
            {/* Mobile drag handle */}
            <div className="block md:hidden drag-handle" />

            <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/40 pb-3 mt-2 md:mt-0">Write a Review</h3>
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {reviewSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="font-bold text-lg text-foreground">Review Submitted!</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                  Thank you for sharing your experience!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
                
                <div className="flex flex-col gap-1 items-center my-2 text-foreground">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition-transform hover:scale-110 p-1 cursor-pointer"
                      >
                        <Star
                          className={`h-7 w-7 transition-colors duration-150 ${
                            star <= reviewRating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-muted-foreground/35 hover:text-amber-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Comments / Feedback</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the item condition, owner communication, and overall experience..."
                    rows={4}
                    className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
                  />
                </div>

                {reviewError && (
                  <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[10px]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 mt-2"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
