'use client';

import React, { useEffect } from 'react';
import { useBookingStore } from '../../store/bookingStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { Clock, Calendar, CheckCircle2, XCircle, Play } from 'lucide-react';

export default function BookingRequests() {
  const { showToast } = useToast();
  const { ownerBookings, fetchOwnerBookings, acceptBooking, rejectBooking, updateBookingStatus } = useBookingStore();

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
    if (!confirm('Are you sure you want to reject this booking request?')) return;
    try {
      await rejectBooking(bookingId);
      showToast('Booking request rejected.', 'info');
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
  );
}
