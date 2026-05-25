'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useListingStore } from '../store/listingStore';
import { useBookingStore } from '../store/bookingStore';
import { useDashboardStore } from '../store/dashboardStore';
import { MockLocation } from '../lib/constants';
import { Plus, RefreshCw, ShieldAlert, ArrowLeft, LayoutGrid, Package, Calendar } from 'lucide-react';

// Import subcomponents
import Overview from './dashboard/Overview';
import MyListings from './dashboard/MyListings';
import ListingForm from './dashboard/ListingForm';
import BookingRequests from './dashboard/BookingRequests';
import AdminConsole from './dashboard/AdminConsole';

interface DashboardViewProps {
  user: any;
  currentLocation: MockLocation;
  initialShowAddForm?: boolean;
  onCloseAddForm?: () => void;
  initialTab?: 'overview' | 'listings' | 'requests' | 'rentals' | 'chats' | 'admin';
  onStatsUpdate?: (unread: number, pending: number) => void;
  onTabChange?: (tab: 'overview' | 'listings' | 'requests' | 'rentals' | 'chats' | 'admin') => void;
  chatRecipientId?: string | null;
  onClearChatRecipient?: () => void;
}

export default function DashboardView({ 
  user: initialUser, 
  currentLocation,
  initialShowAddForm,
  onCloseAddForm,
  initialTab,
  onStatsUpdate,
  onTabChange,
  chatRecipientId,
  onClearChatRecipient
}: DashboardViewProps) {
  const { user } = useAuthStore();
  const { myListings, fetchMyListings } = useListingStore();
  const { renterBookings, ownerBookings, fetchRenterBookings, fetchOwnerBookings } = useBookingStore();
  const { activeTab, setActiveTab, notifications, fetchNotifications } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(initialShowAddForm || false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // Sync activeTab with initialTab prop
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab as any);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyListings(),
        fetchRenterBookings(),
        fetchOwnerBookings(),
        fetchNotifications().catch(() => {}),
      ]);
    } catch (err) {
      console.error('Error loading dashboard console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Trigger form opening when navigated from FAB
  useEffect(() => {
    if (initialShowAddForm) {
      setEditingListingId(null);
      setShowAddForm(true);
      if (onCloseAddForm) {
        onCloseAddForm();
      }
    }
  }, [initialShowAddForm]);

  const handleEditListing = (id: string) => {
    setEditingListingId(id);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingListingId(null);
    fetchMyListings();
  };

  // Stats Aggregations
  const pendingRequestsCount = ownerBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'pending').length;
  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Sync stats badge counts back to parent page component
  useEffect(() => {
    if (onStatsUpdate) {
      onStatsUpdate(unreadNotificationsCount, pendingRequestsCount);
    }
  }, [unreadNotificationsCount, pendingRequestsCount, onStatsUpdate]);

  return (
    <div className="w-full py-6 animate-in fade-in duration-300 relative z-10 font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/[0.03] via-card to-card p-6 md:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-sm mb-8">
          <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight flex items-center gap-2">
              {activeTab === 'admin' ? 'Admin Control Center' : 'Marketplace Dashboard'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 flex-wrap">
              Welcome back, <span className="font-bold text-primary">{user?.name || initialUser?.name}</span>.
              {user?.verificationLevel && user.verificationLevel !== 'none' && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                  user.verificationLevel === 'Trusted User' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25' :
                  user.verificationLevel === 'ID Verified' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' :
                  'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                }`}>
                  {user.verificationLevel}
                </span>
              )}
              {activeTab === 'admin' ? 'Manage system audits, listings moderation, and verification queues.' : 'Unified console for your listings, rentals, and earnings.'}
            </p>
          </div>
          
          <div className="relative z-10 flex items-center gap-2.5">
            {activeTab === 'admin' ? (
              <button
                onClick={() => handleTabChange('overview')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#f8faf9] text-foreground text-xs font-black rounded-xl border border-border/60 transition active:scale-95 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={fetchDashboardData}
                  title="Refresh Dashboard"
                  className="p-2.5 bg-white dark:bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/30 rounded-xl transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleTabChange('admin')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black rounded-xl transition active:scale-95 cursor-pointer shadow-md shadow-orange-600/15"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    Admin Console
                  </button>
                )}

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
              </>
            )}
          </div>
        </div>

        {/* Dashboard Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="text-xs font-semibold">Loading marketplace console...</p>
          </div>
        )}

        {/* Dashboard Redesigned Sidebar Layout */}
        {!loading && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Sticky Sidebar Navigation */}
            <div className="w-full lg:w-60 shrink-0 flex flex-col gap-4 sticky lg:top-24 z-20">
              
              {/* User details card inside sidebar */}
              <div className="hidden lg:flex items-center gap-3 p-4 rounded-3xl border border-border/80 bg-white shadow-xs">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover border border-border/20 bg-muted shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-foreground truncate">{user?.name}</p>
                  <span className="text-[8px] bg-primary/10 text-primary border border-primary/15 font-black uppercase px-2 py-0.5 rounded-md mt-0.5 block w-fit">
                    {user?.verificationLevel === 'none' ? 'Unverified' : user?.verificationLevel}
                  </span>
                </div>
              </div>

              {/* Sidebar Buttons container */}
              <div className="flex flex-row lg:flex-col gap-1.5 p-1 bg-muted/60 border border-border/60 lg:border-none lg:bg-transparent rounded-2xl w-full overflow-x-auto hide-scrollbar">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 w-full shrink-0 lg:shrink ${
                    activeTab === 'overview' || activeTab === 'overview'
                      ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                      : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted lg:hover:bg-white lg:hover:border-border/60'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  <span>Overview Console</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="ml-auto flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shrink-0">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => handleTabChange('listings')}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 w-full shrink-0 lg:shrink ${
                    activeTab === 'listings' 
                      ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                      : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted lg:hover:bg-white lg:hover:border-border/60'
                  }`}
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span>My Listings</span>
                  <span className="ml-auto text-[9px] font-black text-muted-foreground/60 shrink-0">({myListings.length})</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('requests')}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 w-full shrink-0 lg:shrink ${
                    activeTab === 'requests' 
                      ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                      : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted lg:hover:bg-white lg:hover:border-border/60'
                  }`}
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Booking Requests</span>
                  {pendingRequestsCount > 0 && (
                    <span className="ml-auto flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white animate-pulse shrink-0">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleTabChange('admin')}
                    className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 w-full shrink-0 lg:shrink ${
                      activeTab === 'admin' 
                        ? 'bg-orange-600 text-white border border-orange-600 shadow-sm shadow-orange-600/10' 
                        : 'text-orange-500 hover:text-orange-600 border border-transparent hover:bg-orange-500/10 lg:hover:bg-white lg:hover:border-orange-500/20'
                    }`}
                  >
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Admin Console</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Panel - Active Content View */}
            <div className="flex-grow w-full min-w-0">
              {activeTab === 'admin' && user?.role === 'admin' ? (
                <AdminConsole />
              ) : (
                <div className="w-full">
                  {activeTab === 'overview' && <Overview />}
                  {activeTab === 'listings' && <MyListings onEditListing={handleEditListing} onAddListing={() => setShowAddForm(true)} />}
                  {activeTab === 'requests' && <BookingRequests />}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Listing Form Modal */}
      <ListingForm
        isOpen={showAddForm}
        onClose={handleCloseForm}
        editingListingId={editingListingId}
        currentLocation={currentLocation}
      />
    </div>
  );
}


