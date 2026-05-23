'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBookingStore } from '../../../store/bookingStore';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../lib/utils';
import { api } from '../../../lib/api';
import { 
  ArrowLeft, Calendar, Shield, User, MessageSquare, AlertTriangle, 
  CheckCircle, Play, XCircle, Star, X, CheckCircle2, ShieldCheck, Loader2
} from 'lucide-react';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { 
    renterBookings, 
    ownerBookings, 
    fetchRenterBookings, 
    fetchOwnerBookings,
    acceptBooking,
    rejectBooking,
    cancelBooking,
    updateBookingStatus
  } = useBookingStore();

  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'renter' | 'owner' | null>(null);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const bookingId = params.id as string;

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchRenterBookings(),
        fetchOwnerBookings()
      ]);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!bookingId) return;

    // Search renter bookings first
    let found = renterBookings.find(b => b._id === bookingId);
    if (found) {
      setBooking(found);
      setRole('renter');
      return;
    }

    // Search owner bookings
    found = ownerBookings.find(b => b._id === bookingId);
    if (found) {
      setBooking(found);
      setRole('owner');
      return;
    }
  }, [bookingId, renterBookings, ownerBookings]);

  const handleAccept = async () => {
    try {
      await acceptBooking(bookingId);
      showToast('Booking request accepted successfully!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept request.', 'error');
    }
  };

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await rejectBooking(bookingId);
      showToast('Booking request rejected.', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject request.', 'error');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId);
      showToast('Booking cancelled.', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleUpdateStatus = async (status: 'active' | 'completed') => {
    try {
      await updateBookingStatus(bookingId, status);
      showToast(`Booking status updated to ${status}.`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const handleOpenReviewModal = () => {
    setReviewRating(5);
    setReviewComment('');
    setReviewError('');
    setReviewSuccess(false);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    const listingId = booking?.listing?._id || booking?.listingId?._id || booking?.listing;

    if (!listingId) {
      setReviewError('Listing ID is missing.');
      setSubmittingReview(false);
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a comment.');
      setSubmittingReview(false);
      return;
    }

    try {
      await api.reviews.create(listingId, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviewSuccess(true);
      showToast('Review submitted successfully!', 'success');
      setTimeout(() => {
        setShowReviewModal(false);
        loadData();
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (authLoading || (loading && !booking)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading rental detail...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h2 className="text-lg font-black text-foreground">Authentication Required</h2>
        <p className="text-xs text-muted-foreground">Sign in to view transaction data.</p>
        <Link href="/login" className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl">
          Log In
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <AlertTriangle className="h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-black text-foreground">Booking Not Found</h2>
        <p className="text-xs text-muted-foreground">You may not be authorized to view this booking, or it does not exist.</p>
        <Link href="/bookings" className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </Link>
      </div>
    );
  }

  const listing = booking.listing || booking.listingId;
  const isRenter = role === 'renter';
  const otherParty = isRenter ? booking.owner : booking.renter;
  const otherPartyRole = isRenter ? 'Owner' : 'Renter';
  const status = (booking.status || booking.bookingStatus || '').toLowerCase();

  // Step calculations for progress bar
  // Steps: 1: Pending, 2: Accepted, 3: Active, 4: Completed
  let currentStep = 1;
  if (status === 'accepted') currentStep = 2;
  else if (status === 'active') currentStep = 3;
  else if (status === 'completed') currentStep = 4;
  else if (status === 'rejected' || status === 'cancelled') currentStep = 0; // Error states

  const steps = [
    { title: 'Requested', desc: 'Request sent to owner', step: 1 },
    { title: 'Approved', desc: 'Confirmed by owner', step: 2 },
    { title: 'Handover', desc: 'Item is with renter', step: 3 },
    { title: 'Completed', desc: 'Item returned & checked', step: 4 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      {/* Back button */}
      <Link 
        href="/bookings" 
        className="flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Bookings
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Status & Step Timeline & Info) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Tracker Block */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border/20 pb-4">
              <div>
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Booking ID</span>
                <h2 className="text-sm font-black text-foreground font-mono mt-0.5">{booking._id}</h2>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase mt-1 border ${
                  status === 'pending' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                  status === 'accepted' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
                  status === 'active' ? 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' :
                  status === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                  'bg-rose-500/10 text-rose-700 border-rose-500/20'
                }`}>
                  {status}
                </span>
              </div>
            </div>

            {/* Steps Visual Indicator */}
            {currentStep > 0 ? (
              <div className="flex flex-col gap-6 my-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Rental Lifecycle</h3>
                
                {/* Horizontal steps on desktop, vertical on mobile */}
                <div className="hidden sm:grid grid-cols-4 relative items-start gap-4">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-[12%] right-[12%] h-[2px] bg-border/40 -z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                    />
                  </div>

                  {steps.map((st) => (
                    <div key={st.step} className="flex flex-col items-center text-center gap-2 relative z-10">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border font-bold text-xs transition-all duration-300 ${
                        currentStep >= st.step 
                          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' 
                          : 'bg-background text-muted-foreground border-border/40'
                      }`}>
                        {currentStep > st.step ? <CheckCircle2 className="h-4.5 w-4.5 text-white" /> : st.step}
                      </div>
                      <div>
                        <p className={`text-xs font-extrabold ${currentStep >= st.step ? 'text-foreground' : 'text-muted-foreground'}`}>{st.title}</p>
                        <p className="text-[9px] text-muted-foreground font-semibold leading-tight mt-0.5">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vertical timeline for mobile */}
                <div className="flex sm:hidden flex-col gap-4 pl-2 relative border-l-2 border-border/30 ml-4 py-1">
                  {steps.map((st) => (
                    <div key={st.step} className="flex gap-4 items-start relative">
                      <div className={`absolute left-[-21px] h-6 w-6 rounded-full flex items-center justify-center border font-black text-[10px] transition-all duration-300 ${
                        currentStep >= st.step 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-background text-muted-foreground border-border/40'
                      }`}>
                        {currentStep > st.step ? '✓' : st.step}
                      </div>
                      <div className="flex-grow pt-0.5">
                        <h4 className={`text-xs font-black leading-none ${currentStep >= st.step ? 'text-foreground' : 'text-muted-foreground'}`}>{st.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">{st.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl text-xs font-semibold">
                <XCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="font-extrabold">Rental Request Terminated</p>
                  <p className="text-[10px] mt-0.5 text-rose-500">This request has been cancelled by the user or rejected by the owner.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Block */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-3">Available Actions</h3>
            
            {status === 'pending' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRenter 
                    ? 'The booking request is waiting for owner approval. Your security deposit is authorized but not captured.'
                    : 'The renter is waiting for you to accept this booking request.'}
                </p>
                <div className="flex items-center gap-2">
                  {!isRenter ? (
                    <>
                      <button
                        onClick={handleAccept}
                        className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-emerald-600/20 text-xs active:scale-95 cursor-pointer hover:scale-[1.02] flex items-center gap-1.5"
                      >
                        <CheckCircle className="h-4.5 w-4.5" />
                        Accept Booking
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-5 py-3 bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35 font-extrabold rounded-xl transition-all duration-200 text-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="h-4.5 w-4.5" />
                        Reject Request
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="px-5 py-3 bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35 font-extrabold rounded-xl transition-all duration-200 text-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="h-4.5 w-4.5" />
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === 'accepted' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRenter
                    ? 'Booking confirmed! Awaiting handover from the owner. Contact the owner below to arrange pickup details.'
                    : 'Renter is ready! Handover the item to the renter, inspect the condition, and tap start handover below.'}
                </p>
                <div className="flex items-center gap-2">
                  {!isRenter ? (
                    <button
                      onClick={() => handleUpdateStatus('active')}
                      className="px-5 py-3 bg-indigo-600 text-white hover:brightness-110 font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/20 text-xs active:scale-95 cursor-pointer hover:scale-[1.02] flex items-center gap-1.5"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      Start Handover (Activate)
                    </button>
                  ) : (
                    <button
                      onClick={handleCancel}
                      className="px-5 py-3 bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/35 font-extrabold rounded-xl transition-all duration-200 text-xs active:scale-95 cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            )}

            {status === 'active' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isRenter
                    ? 'Your rental is active! Enjoy the item. Make sure to return it by the agreed date to prevent overdue fees.'
                    : 'The item is with the renter. Once the renter returns the item in good condition, mark it complete below.'}
                </p>
                {!isRenter && (
                  <button
                    onClick={() => handleUpdateStatus('completed')}
                    className="px-5 py-3 bg-primary text-white hover:brightness-110 font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs active:scale-95 cursor-pointer hover:scale-[1.02] flex items-center gap-1.5 self-start"
                  >
                    <CheckCircle className="h-4.5 w-4.5" />
                    Complete Rental & Return
                  </button>
                )}
              </div>
            )}

            {status === 'completed' && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The rental has been returned and completed. 
                  {isRenter ? ' Write a review to help the owner build community credibility.' : ' The escrow security deposit will be processed back to renter.'}
                </p>
                {isRenter && (
                  <button
                    onClick={handleOpenReviewModal}
                    className="px-5 py-3 bg-amber-500/10 text-amber-700 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/35 font-extrabold rounded-xl transition-all duration-200 text-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start"
                  >
                    <Star className="h-4.5 w-4.5 fill-amber-500 text-amber-500" />
                    Leave a Review
                  </button>
                )}
              </div>
            )}

            {['rejected', 'cancelled'].includes(status) && (
              <p className="text-xs text-muted-foreground">
                No active actions available. This request was terminated.
              </p>
            )}
          </div>

          {/* Item Info Summary Card */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Item Details</h3>
            <div className="flex items-start gap-4">
              <img 
                src={listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=120&h=120&q=80'} 
                alt="" 
                className="h-16 w-16 rounded-xl object-cover border border-border/20 bg-muted"
              />
              <div className="flex-grow">
                <h4 className="text-sm font-extrabold text-foreground">{listing?.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">{listing?.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-muted/60 border border-border/20 rounded-md text-[9px] font-black text-muted-foreground uppercase">{listing?.category}</span>
                  <Link href={`/listing/${listing?._id}`} className="text-[10px] font-bold text-primary hover:underline">View original listing</Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Profiles & Pricing Breakdown) */}
        <div className="flex flex-col gap-6">
          
          {/* Party profile Card */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">{otherPartyRole} Details</h3>
            <div className="flex items-center gap-3">
              <img 
                src={otherParty?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                alt="" 
                className="h-10 w-10 rounded-full object-cover border border-border/20 shrink-0 bg-muted"
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-extrabold text-foreground truncate">{otherParty?.name}</h4>
                <p className="text-[10px] text-muted-foreground truncate font-semibold mt-0.5">{otherParty?.email}</p>
              </div>
            </div>

            {/* Quick chat messaging */}
            <button
              onClick={() => router.push(`/dashboard?tab=chats&chatRecipientId=${otherParty?._id}`)}
              className="w-full py-2.5 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 text-[11px] tracking-wide active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message {otherPartyRole}
            </button>
          </div>

          {/* Pricing Summary Card */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Financial Breakdown</h3>
            
            <div className="flex flex-col gap-2.5 text-xs font-semibold">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Rent Rate</span>
                <span className="text-foreground font-bold">{formatCurrency(listing?.pricePerDay || 0)} / Day</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Rental Duration</span>
                <span className="text-foreground font-bold">{booking.totalDays} Days</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground border-b border-border/20 pb-2.5">
                <span>Rent Subtotal</span>
                <span className="text-foreground font-bold">{formatCurrency(booking.totalPrice || booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span className="flex items-center gap-1">
                  Security Deposit
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                </span>
                <span className="text-foreground font-bold">{formatCurrency(booking.securityDeposit || booking.depositAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Payment Method</span>
                <span className="text-foreground font-bold font-mono text-[10px]">RAZORPAY</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground border-b border-border/20 pb-2.5">
                <span>Payment Status</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                  booking.paymentStatus === 'captured' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                }`}>
                  {booking.paymentStatus || 'pending'}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm font-black pt-1.5 text-foreground">
                <span>Total Charge</span>
                <span>{formatCurrency((booking.totalPrice || booking.totalAmount) + (booking.securityDeposit || booking.depositAmount))}</span>
              </div>
            </div>

            {/* Escrow Disclaimer */}
            <div className="p-3 bg-muted/40 border border-border/20 rounded-2xl flex gap-2 text-[10px] text-muted-foreground leading-relaxed mt-1 font-semibold">
              <Shield className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>
                Security deposits are held in **escrow** by Lentive and are released back to the renter only after the owner completes the return validation.
              </span>
            </div>
          </div>

        </div>

      </div>

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
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 mt-2 flex items-center justify-center gap-2"
                >
                  {submittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
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
