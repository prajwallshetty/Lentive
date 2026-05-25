'use client';

import React, { useEffect, useState } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { api } from '../../lib/api';
import { 
  Clock, Calendar, CheckCircle2, XCircle, Play, Star, X, 
  AlertCircle, ShieldCheck, ShieldAlert, BadgeCheck, Sparkles, 
  Info, CreditCard, ArrowRight, User 
} from 'lucide-react';

export default function BookingRequests() {
  const { showToast } = useToast();
  const { ownerBookings, fetchOwnerBookings, acceptBooking, rejectBooking, updateBookingStatus } = useBookingStore();

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewRenterName, setReviewRenterName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchOwnerBookings();
  }, []);

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      await acceptBooking(bookingId);
      showToast('Booking request accepted successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to accept booking request.', 'error');
    }
  };

  const handleRejectRequest = async (bookingId: string) => {
    if (!confirm('Are you sure you want to reject this booking request? This will initiate an automatic refund.')) return;
    try {
      await rejectBooking(bookingId);
      showToast('Booking request rejected. Refund initiated.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to reject booking request.', 'error');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: 'active' | 'completed') => {
    try {
      await updateBookingStatus(bookingId, status);
      showToast(`Booking marked as ${status}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update booking status.', 'error');
    }
  };

  const handleOpenReviewModal = (booking: any) => {
    setReviewBookingId(booking._id);
    setReviewRenterName(booking.renter?.name || 'Renter');
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

    if (!reviewBookingId) return;
    if (!reviewComment.trim()) {
      setReviewError('Please enter a review comment.');
      return;
    }

    try {
      await api.reviews.createBookingReview(reviewBookingId, {
        rating: reviewRating,
        comment: reviewComment
      });

      setReviewSuccess(true);
      showToast('Renter reviewed successfully!', 'success');
      setTimeout(() => {
        setShowReviewModal(false);
        fetchOwnerBookings();
      }, 1500);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let classes = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    let label = 'Unknown';

    if (s === 'pending_payment') {
      classes = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 animate-pulse';
      label = 'Awaiting Payment';
    } else if (s === 'pending') {
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
      label = 'Active';
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

  const getRenterLevelStyles = (level: string) => {
    const l = (level || '').toLowerCase();
    if (l === 'trusted user') {
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    } else if (l === 'id verified') {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    } else if (l === 'basic verified') {
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/10';
  };

  const getPendingCount = () => {
    return ownerBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'pending').length;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Summary Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Inbound Dashboard</h3>
          <h2 className="text-lg font-black text-foreground mt-0.5">Booking Requests Box</h2>
          <p className="text-xs text-muted-foreground mt-1">Review renter profiles, verified credentials, and secure escrow deposits.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-primary/10 text-primary border border-primary/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-xl font-black">{ownerBookings.length}</p>
            <p className="text-[9px] uppercase font-bold text-primary/80">Total Received</p>
          </div>
          <div className="bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-xl font-black">{getPendingCount()}</p>
            <p className="text-[9px] uppercase font-bold text-amber-700/80">Awaiting Action</p>
          </div>
        </div>
      </div>

      {ownerBookings.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-white py-16 px-4 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-[#f6faf8] flex items-center justify-center text-primary border border-primary/10 mb-1">
            <Clock className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h4 className="font-extrabold text-sm text-foreground">Inbox is Clear</h4>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            When neighbors choose to rent your listed inventory, their requests will appear here for audit, verification checks, and final approval.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ownerBookings.map((b) => {
            const status = (b.status || b.bookingStatus || '').toLowerCase();
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const daysCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
            
            return (
              <div 
                key={b._id} 
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-white p-5 hover:border-primary/25 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row gap-5 justify-between"
              >
                
                {/* Left Side: Product and Renter Details */}
                <div className="flex flex-col sm:flex-row gap-4 items-start flex-grow">
                  {/* Listing Image */}
                  <div className="relative h-20 w-28 rounded-2xl overflow-hidden border border-border/20 shrink-0 bg-muted">
                    <img 
                      src={b.listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=120&h=80&q=80'} 
                      alt="" 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[9px] font-black text-white border border-white/15">
                      {daysCount} {daysCount === 1 ? 'day' : 'days'}
                    </span>
                  </div>

                  {/* Descriptions */}
                  <div className="flex-grow flex flex-col justify-between h-full min-w-0">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors duration-200">
                          {b.listing?.title}
                        </h4>
                        {b.listing?.category === 'Vehicles' && (
                          <span className="text-[8px] bg-purple-500/10 text-purple-600 font-bold px-2 py-0.5 rounded-md border border-purple-500/20">
                            Driving Permit Audited
                          </span>
                        )}
                      </div>

                      {/* Renter profile card */}
                      <div className="flex items-center gap-2 mt-2 bg-[#f8faf9] px-3 py-1.5 rounded-xl border border-border/40 w-fit max-w-full">
                        <img
                          src={b.renter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                          alt=""
                          className="h-5 w-5 rounded-full object-cover border border-border/40 shrink-0"
                        />
                        <div className="text-[10px] text-muted-foreground truncate leading-tight">
                          Renter: <span className="font-bold text-foreground">{b.renter?.name}</span>
                          <span className="mx-1.5 font-light">|</span>
                          <span>{b.renter?.email}</span>
                          {b.renter?.verificationLevel && b.renter.verificationLevel !== 'none' && (
                            <span className={`ml-2 text-[8px] px-1.5 py-0.5 rounded-sm font-black border ${getRenterLevelStyles(b.renter.verificationLevel)}`}>
                              {b.renter.verificationLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[10px] font-bold text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-[#f8faf9] px-2 py-1 border border-border/40 rounded-lg">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        <ArrowRight className="h-3 w-3 text-muted-foreground/60 mx-0.5" />
                        {end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Financial Overview & CTA Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-border/40 pt-4 sm:pt-0 lg:pt-0 lg:pl-6 shrink-0 lg:w-60">
                  {/* Pricing metrics */}
                  <div className="flex flex-col text-left sm:text-left lg:text-right font-semibold">
                    <p className="text-xs text-muted-foreground">Renter Paid</p>
                    <p className="text-lg font-black text-foreground leading-tight">
                      {formatCurrency(b.totalPrice || b.totalAmount)}
                    </p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/10 w-fit sm:w-fit lg:ml-auto mt-1 flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Deposit: {formatCurrency(b.securityDeposit || b.depositAmount)} Escrow Safe
                    </span>
                  </div>

                  {/* Actions pills */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end w-full sm:w-auto lg:w-full">
                    {status === 'pending' && (
                      <div className="flex gap-2 w-full justify-end">
                        <button
                          onClick={() => handleRejectRequest(b._id)}
                          className="px-4 py-2.5 bg-rose-500/10 text-rose-600 border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] flex-grow sm:flex-grow-0"
                        >
                          <XCircle className="h-4 w-4" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleAcceptRequest(b._id)}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5 min-h-[38px] flex-grow sm:flex-grow-0"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept
                        </button>
                      </div>
                    )}

                    {status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b._id, 'active')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] shadow-md shadow-indigo-600/10"
                      >
                        <Play className="h-4 w-4 fill-white" />
                        Handover (Start)
                      </button>
                    )}

                    {status === 'active' && (
                      <button
                        onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                        className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white hover:brightness-110 active:scale-95 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 min-h-[38px] shadow-md shadow-primary/10"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Rental
                      </button>
                    )}

                    {status === 'completed' && (
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
                        <button
                          onClick={() => handleOpenReviewModal(b)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer min-h-[34px]"
                        >
                          <Star className="h-3.5 w-3.5 fill-white text-purple-100" />
                          Rate Renter
                        </button>
                        {renderStatusBadge(status)}
                      </div>
                    )}

                    {['rejected', 'cancelled', 'pending_payment'].includes(status) && (
                      <div className="ml-auto">
                        {renderStatusBadge(b.status || b.bookingStatus)}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Owner-to-Renter Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full md:max-w-md max-h-[92vh] md:max-h-[95vh] overflow-y-auto rounded-t-[28px] md:rounded-3xl bg-white border border-border/80 p-6 shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mt-2 md:mt-0">
              <div>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Audit & feedback</span>
                <h3 className="text-base font-black text-foreground tracking-tight mt-1">Review Renter: {reviewRenterName}</h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {reviewSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
                <div className="h-16 w-16 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-extrabold text-base text-foreground">Review Submitted!</h4>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[240px] leading-relaxed">
                  Thank you for rating your renter. Your feedback completes the trust loop of Lentive.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4 mt-4 text-xs font-semibold">
                
                {/* Star rating selector */}
                <div className="flex flex-col gap-1 items-center bg-[#f8faf9] border border-border/40 rounded-2xl py-4 text-foreground">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-black mb-1">Renter Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="transition-all hover:scale-110 p-1 cursor-pointer"
                      >
                        <Star className={`h-8 w-8 transition-colors ${star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground/30'}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-amber-600 mt-1 uppercase tracking-wider">
                    {reviewRating === 5 ? 'Excellent Experience' : reviewRating === 4 ? 'Good Experience' : reviewRating === 3 ? 'Average' : reviewRating === 2 ? 'Below Average' : 'Poor Experience'}
                  </span>
                </div>

                {/* Comment area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Write Your Remarks</label>
                  <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe how the renter treated your item, punctuality during pickup/dropoff, and overall communication..."
                    rows={4}
                    className="rounded-2xl border border-border bg-white p-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none text-xs font-medium leading-relaxed"
                  />
                </div>

                {reviewError && (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-500/5 border border-rose-500/15 p-3 rounded-2xl text-[10px] leading-relaxed">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-primary hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer mt-2 shadow-md shadow-primary/10"
                >
                  Submit Renter Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

