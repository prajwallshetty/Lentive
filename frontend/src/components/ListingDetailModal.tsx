'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, ShieldCheck, MapPin, Star, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';

interface ListingDetailModalProps {
  listing: any;
  user: any;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function ListingDetailModal({ listing, user, onClose, onBookingSuccess }: ListingDetailModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Recalculate price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setDays(diffDays);
        setTotalPrice(diffDays * listing.pricePerDay);
        setError('');
      } else {
        setDays(0);
        setTotalPrice(0);
        setError('End date must be after start date');
      }
    } else {
      setDays(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, listing.pricePerDay]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please login first to reserve items.');
      return;
    }
    if (user.id === listing.owner?._id || user.id === listing.owner) {
      setError('You cannot rent your own item.');
      return;
    }
    if (days <= 0) {
      setError('Please select valid booking dates.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.bookings.create({
        listingId: listing._id,
        startDate,
        endDate
      });
      setSuccess(true);
      setTimeout(() => {
        onBookingSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking request.');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && (user.id === listing.owner?._id || user.id === listing.owner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-card border border-border text-foreground shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-4">
          
          {/* Main Content - Left 3 Columns */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold text-accent uppercase tracking-widest">{listing.category}</span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1 leading-tight">{listing.title}</h2>
              
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4 text-accent" />
                <span>{listing.address}</span>
              </div>
            </div>

            {/* Image Showcase */}
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-secondary border border-border">
              <img
                src={listing.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold text-base border-b border-border/80 pb-2">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2.5">
                {listing.description}
              </p>
            </div>

            {/* Owner Section */}
            <div className="flex items-center justify-between rounded-2xl border border-border p-4 bg-muted/40">
              <div className="flex items-center gap-3">
                <img
                  src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                  alt={listing.owner?.name || 'Owner'}
                  className="h-11 w-11 rounded-full object-cover border border-border shadow-sm"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Offered by</p>
                  <p className="text-sm font-bold text-foreground">{listing.owner?.name || 'Local Host'}</p>
                </div>
              </div>
              
              {listing.owner?.ratings && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{(listing.owner.ratings.average || 5.0).toFixed(1)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{listing.owner.ratings.count || 3} reviews</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Side Widget - Right 2 Columns */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/5">
              
              {/* Daily pricing head */}
              <div className="flex items-baseline justify-between border-b border-border pb-4 mb-4">
                <div>
                  <span className="text-2xl font-black text-foreground">{formatCurrency(listing.pricePerDay)}</span>
                  <span className="text-xs text-muted-foreground"> / day</span>
                </div>
                {listing.ratings && listing.ratings.count > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>{listing.ratings.average.toFixed(1)}</span>
                    <span className="text-muted-foreground">({listing.ratings.count})</span>
                  </div>
                )}
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-3" />
                  <h4 className="font-bold text-lg text-foreground">Reservation Sent!</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                    Your booking request has been sent to the owner. Redirecting...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="flex flex-col gap-4">
                  {/* Date pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="rounded-xl border border-border bg-transparent p-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">End Date</label>
                      <input
                        type="date"
                        required
                        value={endDate}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="rounded-xl border border-border bg-transparent p-2 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing break downs */}
                  {days > 0 && (
                    <div className="flex flex-col gap-2 bg-secondary/50 rounded-2xl p-4 mt-2 border border-border/40 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>{formatCurrency(listing.pricePerDay)} × {days} days</span>
                        <span className="font-semibold text-foreground">{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Refundable deposit</span>
                        <span className="font-semibold text-foreground">{formatCurrency(listing.securityDeposit)}</span>
                      </div>
                      <div className="h-[1px] bg-border my-1" />
                      <div className="flex justify-between text-sm font-extrabold">
                        <span>Total Due</span>
                        <span className="text-accent">{formatCurrency(totalPrice + listing.securityDeposit)}</span>
                      </div>
                    </div>
                  )}

                  {/* Warning for owners */}
                  {isOwner && (
                    <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-500 border border-amber-500/20">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>This is your listing. You cannot rent your own items.</span>
                    </div>
                  )}

                  {/* Error Notification */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20 animate-shake">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isOwner}
                    className="w-full py-3 bg-accent text-white font-bold rounded-2xl hover:bg-accent/90 disabled:opacity-50 transition shadow-lg shadow-accent/20 text-sm mt-2"
                  >
                    {loading ? 'Reserving...' : 'Reserve Rental'}
                  </button>

                  <div className="flex items-center justify-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Refundable security deposit is protected</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
