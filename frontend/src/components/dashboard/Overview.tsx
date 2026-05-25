'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { useBookingStore } from '../../store/bookingStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { usePaymentStore } from '../../store/paymentStore';
import { formatCurrency } from '../../lib/utils';
import Verification from './Verification';
import { DollarSign, Package, ShoppingBag, Calendar, Bell, Shield, Heart } from 'lucide-react';

export default function Overview() {
  const { user } = useAuthStore();
  const { myListings, fetchMyListings } = useListingStore();
  const { renterBookings, ownerBookings, fetchRenterBookings, fetchOwnerBookings } = useBookingStore();
  const { notifications, fetchNotifications, markNotificationAsRead } = useDashboardStore();
  const { transactions, fetchHistory } = usePaymentStore();

  useEffect(() => {
    fetchMyListings();
    fetchRenterBookings();
    fetchOwnerBookings();
    fetchNotifications();
    fetchHistory();
  }, []);

  // Calculate earnings from accepted, active, completed bookings
  const acceptedOwnerBookings = ownerBookings.filter(b => 
    ['accepted', 'active', 'completed'].includes((b.status || b.bookingStatus || '').toLowerCase())
  );
  const totalEarnings = acceptedOwnerBookings.reduce((sum, b) => sum + (b.totalPrice || b.totalAmount || 0), 0);

  // Active rentals count (status is 'active')
  const activeRentalsCount = renterBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'active').length + 
                             ownerBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'active').length;

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

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

  const activeRentalsList = [
    ...renterBookings.map(b => ({ ...b, role: 'renter' })),
    ...ownerBookings.map(b => ({ ...b, role: 'owner' }))
  ].filter(b => ['accepted', 'active'].includes((b.status || b.bookingStatus || '').toLowerCase()));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Stats Panel - Left 2 columns */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Earnings */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md shadow-xs">
            <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Total Earnings</p>
              <p className="text-xl font-black text-foreground mt-0.5">{formatCurrency(totalEarnings)}</p>
            </div>
          </div>

          {/* My Listed Items */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md shadow-xs">
            <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">My Inventory</p>
              <p className="text-xl font-black text-foreground mt-0.5">{myListings.length} items</p>
            </div>
          </div>

          {/* Active Bookings (Both) */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-white p-5 flex items-center gap-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md shadow-xs">
            <div className="absolute top-0 right-0 h-20 w-20 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/25 shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-black">Active Handovers</p>
              <p className="text-xl font-black text-foreground mt-0.5">{activeRentalsCount} bookings</p>
            </div>
          </div>
        </div>

        {/* Weekly Earnings Trend SVG Chart */}
        <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Earnings Analysis</h3>
              <p className="text-sm font-extrabold text-foreground mt-0.5">Weekly Performance Trends</p>
            </div>
            <span className="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
              +14.8% vs last month
            </span>
          </div>
          
          <div className="relative w-full h-36 mt-2 bg-[#f8faf9] border border-border/60 rounded-2xl overflow-hidden flex items-end px-2 py-5">
            <div className="absolute inset-0 grid grid-cols-7 gap-1 px-4 py-2 pointer-events-none">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-full border-r border-dashed border-border/30" />
              ))}
            </div>
            
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0,25 Q 15,18 30,10 T 60,16 T 90,8 T 100,12 L 100,30 L 0,30 Z"
                fill="url(#chart-grad)"
              />
              <path
                d="M 0,25 Q 15,18 30,10 T 60,16 T 90,8 T 100,12"
                fill="none"
                stroke="#059669"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="30" cy="10" r="1.2" fill="#059669" stroke="#ffffff" strokeWidth="0.5" />
              <circle cx="90" cy="8" r="1.2" fill="#059669" stroke="#ffffff" strokeWidth="0.5" />
            </svg>
            
            <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest select-none">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Quick Status / Calendar list */}
        <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border/10 pb-3 mb-4 flex items-center justify-between">
            <span>Active & Upcoming Rentals</span>
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
              Unified Tracker
            </span>
          </h3>

          {activeRentalsList.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary/45 border border-primary/15 mb-1">
                <Calendar className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-xs text-foreground">No Active Rentals</h4>
              <p className="text-[10px] text-muted-foreground max-w-[200px] leading-relaxed font-semibold">
                You don't have any active handovers or confirmed rentals currently.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeRentalsList.map((b) => (
                <div key={b._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/50 bg-muted/15 hover:bg-muted/30 transition-all duration-200">
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
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          {b.role === 'renter' ? 'Renting' : 'Lending'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">
                        {b.role === 'renter' ? `Owner: ${b.owner?.name}` : `Renter: ${b.renter?.name}`} • {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
                    <div className="text-xs">
                      <p className="font-extrabold text-foreground">{formatCurrency(b.totalPrice || b.totalAmount)}</p>
                      <p className="text-[9px] text-muted-foreground font-bold">{b.totalDays || Math.ceil((new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 3600 * 24))} days</p>
                    </div>
                    {renderStatusBadge(b.status || b.bookingStatus)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Escrow & Transaction History */}
        <div className="rounded-2xl border border-border/80 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-extrabold text-foreground border-b border-border/10 pb-3 mb-4 flex items-center justify-between">
            <span>Escrow & Transaction History</span>
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none">
              Safe Escrow Logs
            </span>
          </h3>

          {transactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No payments processed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/20 text-muted-foreground font-bold">
                    <th className="py-2">Item</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map((tx) => (
                    <tr key={tx._id} className="border-b border-border/10 hover:bg-muted/10">
                      <td className="py-2.5 font-bold truncate max-w-[120px] text-foreground">
                        {tx.bookingId?.listingId?.title || 'Seeded Rental'}
                      </td>
                      <td className="py-2.5 capitalize">{tx.type}</td>
                      <td className="py-2.5 font-bold">{formatCurrency(tx.amount)}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                          tx.status === 'captured' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                          tx.status === 'refunded' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                          tx.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                          'bg-rose-50 text-rose-600 border border-rose-200'
                        }`}>
                          {tx.status === 'captured' ? 'success' : tx.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Right Side Panel - Column 3 */}
      <div className="flex flex-col gap-6">
        
        {/* Identity Verification Card */}
        <Verification />

        {/* Notification Center Panel */}
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
                  onClick={() => !n.isRead && markNotificationAsRead(n._id)}
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
                        className="text-primary hover:underline font-bold"
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

    </div>
  );
}
