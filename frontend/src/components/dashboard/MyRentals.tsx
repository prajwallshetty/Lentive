'use client';

import React, { useState, useEffect } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { ShoppingBag, Calendar, XCircle, Star, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyRentals() {
  const { showToast } = useToast();
  const { renterBookings, fetchRenterBookings, cancelBooking } = useBookingStore();

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewListingId, setReviewListingId] = useState<string | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchRenterBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will notify the other party.')) return;
    try {
      await cancelBooking(bookingId);
      showToast('Booking cancelled successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setReviewListingId(booking.listing?._id || booking.listingId?._id || booking.listing);
    setReviewBookingId(booking._id);
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

    if (!reviewBookingId) {
      setReviewError('Booking ID is missing.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please provide a comment.');
      return;
    }

    try {
      await api.reviews.createBookingReview(reviewBookingId, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess(true);
      showToast('Review submitted successfully!', 'success');
      
      setTimeout(() => {
        setShowReviewModal(false);
        fetchRenterBookings();
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
      showToast(err.message || 'Failed to submit review.', 'error');
    }
  };

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
