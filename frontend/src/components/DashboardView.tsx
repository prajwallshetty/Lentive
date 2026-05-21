'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { MockLocation } from '../lib/constants';
import { useToast } from '../context/ToastContext';
import { 
  Plus, DollarSign, Package, ShoppingBag, 
  CheckCircle2, Clock, Calendar, PlusCircle,
  Pencil, Trash2, Star, X, Upload, AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  user: any;
  currentLocation: MockLocation;
  initialShowAddForm?: boolean;
  onCloseAddForm?: () => void;
}

export default function DashboardView({ 
  user, 
  currentLocation,
  initialShowAddForm,
  onCloseAddForm
}: DashboardViewProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'requests' | 'listings' | 'rentals'>('stats');
  const [bookings, setBookings] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  
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
    try {
      if (user.role === 'owner') {
        const bookingsRes = await api.bookings.getOwnerBookings();
        setBookings(bookingsRes.bookings || []);
        
        // Fetch listings belonging to the owner
        const listingsRes = await api.listings.getAll();
        const myItems = (listingsRes.listings || []).filter(
          (item: any) => item.owner?._id === user.id || item.owner === user.id
        );
        setListings(myItems);
      } else {
        const rentalsRes = await api.bookings.getRenterBookings();
        setBookings(rentalsRes.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
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
      setActiveTab('listings');
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

  const handleUpdateStatus = async (bookingId: string, status: 'approved' | 'completed' | 'cancelled') => {
    try {
      await api.bookings.updateStatus(bookingId, status);
      showToast(`Booking marked as ${status}.`, 'success');
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to update booking status.', 'error');
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setReviewListingId(booking.listing?._id || booking.listing);
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

  // Stats calculators
  const approvedBookings = bookings.filter(b => b.status === 'approved' || b.status === 'active' || b.status === 'completed');
  const totalEarnings = approvedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="w-full py-6 animate-in fade-in duration-300 relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 border-b border-border/40 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {user.role === 'owner' ? 'Hosting Console' : 'Renter Console'}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Logged in as <span className="font-semibold text-primary">{user.name}</span> ({user.email})
            </p>
          </div>
          
          {user.role === 'owner' && (
            <button
              onClick={() => {
                setEditingListingId(null);
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              List an Item
            </button>
          )}
        </div>

        {/* Dashboard Tabs Segment Control */}
        <div className="flex gap-1 bg-muted dark:bg-black/10 border border-border/40 p-1 rounded-xl my-6 w-fit overflow-x-auto hide-scrollbar">
          {user.role === 'owner' ? (
            <>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'stats' 
                    ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                    : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'requests' 
                    ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                    : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
                }`}
              >
                Rental Requests
                {pendingCount > 0 && (
                  <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'listings' 
                    ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                    : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
                }`}
              >
                My Items ({listings.length})
              </button>
            </>
          ) : (
            <button
              onClick={() => setActiveTab('rentals')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeTab === 'rentals' 
                  ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10' 
                  : 'text-muted-foreground border border-transparent hover:text-foreground hover:bg-muted'
              }`}
            >
              My Rentals ({bookings.length})
            </button>
          )}
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'stats' && user.role === 'owner' && (
          <div className="flex flex-col gap-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Total Revenue */}
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Total Revenue</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{formatCurrency(totalEarnings)}</p>
                </div>
              </div>

              {/* Active Listings */}
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Active Listings</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{listings.length}</p>
                </div>
              </div>

              {/* Total Bookings */}
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 flex items-center gap-4 transition-all duration-300 hover:border-primary/30 shadow-sm">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold">Total Bookings</p>
                  <p className="text-2xl font-black text-foreground mt-0.5">{bookings.length}</p>
                </div>
              </div>
            </div>

            {/* Quick Requests Snippet */}
            <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground border-b border-border/40 pb-3 mb-4">
                Recent Booking Requests
              </h3>
              {bookings.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No recent requests.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {bookings.slice(0, 3).map((b) => (
                    <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 sm:flex-row sm:items-center transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <img 
                          src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                          alt="" 
                          className="h-10 w-10 rounded-lg object-cover border border-border/20"
                        />
                        <div>
                          <p className="text-xs font-bold text-foreground truncate max-w-[200px]">{b.listing?.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            Renter: <span className="font-semibold text-foreground">{b.renter?.name}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-xs">
                          <p className="font-bold text-foreground">{formatCurrency(b.totalPrice)}</p>
                          <span className="text-[9px] text-muted-foreground">For {Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24))} days</span>
                        </div>
                        
                        {/* Status tag */}
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                          b.status === 'pending' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' :
                          b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                          b.status === 'completed' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab Content */}
        {activeTab === 'requests' && user.role === 'owner' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/40 pb-3 mb-4">Manage Requests</h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No requests found for your items.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b) => (
                  <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:border-primary/25 hover:bg-muted/40 md:flex-row md:items-center transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                        alt="" 
                        className="h-12 w-12 rounded-lg object-cover border border-border/20"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{b.listing?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Renter: <span className="font-semibold text-foreground">{b.renter?.name}</span> ({b.renter?.email})
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-xs md:text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice)}</p>
                        <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit)} (Refundable)</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/25 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                              className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {b.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'completed')}
                            className="px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/25 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        {b.status !== 'pending' && b.status !== 'approved' && (
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            b.status === 'completed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab Content */}
        {activeTab === 'listings' && user.role === 'owner' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/40 pb-3 mb-4">My Listed Items</h3>
            {listings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">You haven't listed any items yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {listings.map((item) => (
                  <div key={item._id} className="rounded-xl border border-border/30 p-3.5 bg-muted/20 hover:border-primary/35 hover:bg-muted/40 flex flex-col justify-between gap-3.5 transition-all duration-300 group shadow-sm">
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/20 shrink-0">
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
                    <div className="flex items-center justify-end gap-2 border-t border-border/20 pt-2 mt-1">
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
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Pencil className="h-3 w-3 text-primary" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteListing(item._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:border-rose-500/30 border border-rose-500/15 text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rentals Tab Content */}
        {activeTab === 'rentals' && user.role !== 'owner' && (
          <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground border-b border-border/40 pb-3 mb-4">Rental History</h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">You have not booked any rentals yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((b) => (
                  <div key={b._id} className="flex flex-col justify-between items-start gap-4 p-4 rounded-xl border border-border/30 bg-muted/20 hover:border-primary/25 hover:bg-muted/40 md:flex-row md:items-center transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <img 
                        src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                        alt="" 
                        className="h-12 w-12 rounded-lg object-cover border border-border/20"
                      />
                      <div>
                        <p className="text-sm font-bold text-foreground">{b.listing?.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Owner: <span className="font-semibold text-foreground">{b.owner?.name}</span> ({b.owner?.email})
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-primary" />
                          {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-xs md:text-right">
                        <p className="text-sm font-black text-foreground">{formatCurrency(b.totalPrice)}</p>
                        <span className="text-[10px] text-muted-foreground">Deposit: {formatCurrency(b.securityDeposit)}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {b.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                            className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/25 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        )}
                        {b.status === 'completed' && (
                          <button
                            onClick={() => handleOpenReviewModal(b)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/25 text-[10px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer animate-pulse"
                          >
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            Write Review
                          </button>
                        )}
                        {b.status !== 'pending' && (
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            b.status === 'approved' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' :
                            b.status === 'completed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Listing Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border/40 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/40 pb-3">
              {editingListingId ? 'Edit Listed Item' : 'List a New Item'}
            </h3>
            <button
              onClick={handleCloseForm}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
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
              <form onSubmit={handleCreateListing} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
                
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
                      className="rounded-xl border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option>Tools</option>
                      <option>Electronics</option>
                      <option>Vehicles</option>
                      <option>Outdoor</option>
                      <option>Party Supplies</option>
                      <option>Fashion</option>
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
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border/40 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/40 pb-3">Write a Review</h3>
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
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
                
                <div className="flex flex-col gap-1 items-center my-2">
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
                              ? 'fill-amber-450 text-amber-500'
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
