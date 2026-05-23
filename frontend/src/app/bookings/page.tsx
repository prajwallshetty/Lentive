'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '../../store/bookingStore';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { ClipboardList, ShoppingBag, ArrowRightLeft, Calendar, ArrowUpRight, ArrowDownLeft, Shield, ChevronRight, Loader2 } from 'lucide-react';

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { 
    renterBookings, 
    ownerBookings, 
    loading: bookingsLoading, 
    fetchRenterBookings, 
    fetchOwnerBookings 
  } = useBookingStore();

  const [activeTab, setActiveTab] = useState<'renting' | 'lending'>('renting');

  // Handle URL tabs (e.g. ?tab=rentals or ?tab=requests)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'lending' || tab === 'requests' || tab === 'owner') {
      setActiveTab('lending');
    } else {
      setActiveTab('renting');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchRenterBookings();
      fetchOwnerBookings();
    }
  }, [user]);

  // Route protection
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <ClipboardList className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Sign in to view bookings</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Manage your rentals, approve incoming requests, and check your transaction escrow statuses.
        </p>
        <Link
          href="/login?redirect=/bookings"
          className="w-full py-3 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs tracking-wide active:scale-95 cursor-pointer block text-center"
        >
          Sign In / Register
        </Link>
      </div>
    );
  }

  const activeRenterCount = renterBookings.filter(b => ['accepted', 'active'].includes((b.status || b.bookingStatus || '').toLowerCase())).length;
  const pendingRequestsCount = ownerBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'pending').length;

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    let classes = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    let label = 'Unknown';

    if (s === 'pending') {
      classes = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      label = 'Pending';
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
      classes = 'bg-primary/10 text-primary border-primary/20';
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

  const list = activeTab === 'renting' ? renterBookings : ownerBookings;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Bookings Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
            Track ongoing rentals, security deposits escrow, and active orders.
          </p>
        </div>

        {/* Quick Stats banner */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-muted/30 border border-border/30 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-foreground">
            <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
            <span>{activeRenterCount} Outgoing Active</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/30 border border-border/30 px-3.5 py-1.5 rounded-xl text-xs font-extrabold text-foreground relative">
            <ArrowDownLeft className="h-3.5 w-3.5 text-amber-500" />
            <span>{pendingRequestsCount} Pending Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-2 p-1.5 bg-muted/40 border border-border/20 rounded-2xl max-w-md w-full self-start">
        <button
          onClick={() => setActiveTab('renting')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer ${
            activeTab === 'renting'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          Renting (Outgoing)
        </button>
        <button
          onClick={() => setActiveTab('lending')}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 cursor-pointer relative ${
            activeTab === 'lending'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Lending (Incoming)
          {pendingRequestsCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[8px] font-black text-white leading-none">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Bookings List */}
      {bookingsLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground">Loading bookings data...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-border/40 bg-card p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 border border-border/20 mb-1">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="font-extrabold text-sm text-foreground">No bookings found</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {activeTab === 'renting'
              ? 'You have not submitted any rental requests yet. Explore local items nearby.'
              : 'No one has requested your listed products yet. Make sure your listings are active.'}
          </p>
          {activeTab === 'renting' && (
            <Link
              href="/"
              className="mt-2 px-5 py-2.5 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
            >
              Browse Nearby Items
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {list.map((booking) => {
            const isRenting = activeTab === 'renting';
            const listing = (booking.listing || booking.listingId) as any;
            const otherParty = isRenting ? booking.owner : booking.renter;
            const otherPartyRole = isRenting ? 'Owner' : 'Renter';
            const status = (booking.status || booking.bookingStatus || '').toLowerCase();

            return (
              <div 
                key={booking._id}
                className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-border/30 bg-card hover:border-primary/30 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Main Card Content */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img 
                      src={listing?.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=120&h=120&q=80'} 
                      alt="" 
                      className="h-16 w-16 rounded-xl object-cover border border-border/20 bg-muted"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-background p-0.5 rounded-full border border-border/20">
                      {isRenting ? (
                        <div className="bg-primary/10 p-1 rounded-full text-primary">
                          <ArrowUpRight className="h-3 w-3" />
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 p-1 rounded-full text-amber-500">
                          <ArrowDownLeft className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {listing?.title}
                    </h3>
                    
                    {/* User connection info */}
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground font-semibold">
                      <img 
                        src={otherParty?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                        alt="" 
                        className="h-4.5 w-4.5 rounded-full object-cover border border-border/20"
                      />
                      <span>
                        {otherPartyRole}: <span className="font-bold text-foreground">{otherParty?.name}</span>
                      </span>
                    </div>

                    {/* Date details */}
                    <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-muted-foreground font-bold bg-muted/40 border border-border/20 px-2.5 py-1 rounded-lg w-fit">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-muted-foreground/30">•</span>
                      <span>{booking.totalDays} Days</span>
                    </div>
                  </div>
                </div>

                {/* Right side info & action */}
                <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-border/20 pt-4 lg:pt-0">
                  <div className="lg:text-right font-semibold">
                    <div className="text-lg font-black text-foreground">
                      {formatCurrency(booking.totalPrice || booking.totalAmount)}
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center lg:justify-end gap-1 font-bold mt-0.5">
                      <Shield className="h-3 w-3 text-emerald-500" />
                      Deposit: {formatCurrency(booking.securityDeposit || booking.depositAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {renderStatusBadge(booking.status || booking.bookingStatus)}
                    
                    {/* View/Track Status Action Button */}
                    <Link
                      href={`/booking/${booking._id}`}
                      className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 bg-muted/60 border border-border/30 hover:border-primary/20 hover:bg-primary/5 hover:text-primary rounded-xl transition-all duration-200 group active:scale-95"
                      title="Track Booking Status"
                    >
                      <span className="hidden md:inline text-xs font-extrabold mr-1.5">Track Rental</span>
                      <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </Link>
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

export default function BookingsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading Bookings Manager...</p>
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
