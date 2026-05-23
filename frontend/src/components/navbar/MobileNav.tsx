'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Plus, ClipboardList, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDashboardStore } from '../../store/dashboardStore';
import { useBookingStore } from '../../store/bookingStore';

function MobileNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { notifications } = useDashboardStore();
  const { renterBookings, ownerBookings } = useBookingStore();

  const tab = searchParams ? searchParams.get('tab') || '' : '';

  const isExplore = pathname === '/' || pathname === '/listings';
  const isBookings = pathname === '/bookings' || (pathname === '/dashboard' && tab === 'rentals') || pathname.startsWith('/booking/');
  const isCreateListing = pathname === '/create-listing';
  const isDashboard = pathname === '/dashboard' && (tab === 'overview' || tab === 'listings' || tab === 'requests' || tab === 'chats' || tab === 'admin' || !tab);
  const isProfile = pathname === '/profile' || (pathname === '/dashboard' && tab === 'profile') || pathname === '/settings';

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const pendingRequestsCount = ownerBookings.filter(b => (b.status || b.bookingStatus || '').toLowerCase() === 'pending').length;

  return (
    <div className="floating-bottom-nav md:hidden border border-white/10 dark:border-white/5 bg-white/80 dark:bg-[#070c0a]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.5)] rounded-full py-2 px-3 z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto relative">
        
        {/* Explore Route Button */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group relative w-14 ${
            isExplore ? 'text-primary dark:text-[#34d399]' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Explore"
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
            isExplore 
              ? 'bg-primary/10 dark:bg-[#34d399]/15 scale-110 shadow-[0_4px_12px_rgba(0,108,73,0.08)]' 
              : 'bg-transparent group-hover:bg-muted/50 dark:group-hover:bg-white/5'
          }`}>
            <Compass className={`h-5 w-5 transition-all duration-300 group-hover:rotate-12 ${
              isExplore ? 'stroke-[2.5px] text-primary dark:text-[#34d399]' : 'stroke-[2px]'
            }`} />
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 transition-all duration-300 ${
            isExplore ? 'opacity-100 scale-100 font-extrabold' : 'opacity-70 scale-95'
          }`}>
            Explore
          </span>
          {/* Active glow dot */}
          <span className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary dark:bg-[#34d399] transition-all duration-300 ${
            isExplore ? 'opacity-100 scale-100 shadow-[0_0_8px_var(--primary)]' : 'opacity-0 scale-50'
          }`} />
        </Link>

        {/* Bookings/Rentals Route Button */}
        <Link
          href="/dashboard?tab=rentals"
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group relative w-14 ${
            isBookings ? 'text-primary dark:text-[#34d399]' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Bookings"
        >
          <div className="relative">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              isBookings 
                ? 'bg-primary/10 dark:bg-[#34d399]/15 scale-110 shadow-[0_4px_12px_rgba(0,108,73,0.08)]' 
                : 'bg-transparent group-hover:bg-muted/50 dark:group-hover:bg-white/5'
            }`}>
              <ClipboardList className={`h-5 w-5 transition-all duration-300 ${
                isBookings ? 'stroke-[2.5px] text-primary dark:text-[#34d399]' : 'stroke-[2px]'
              }`} />
            </div>
            {pendingRequestsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-white animate-pulse shadow-md border border-white dark:border-[#070c0a]">
                {pendingRequestsCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 transition-all duration-300 ${
            isBookings ? 'opacity-100 scale-100 font-extrabold' : 'opacity-70 scale-95'
          }`}>
            Rentals
          </span>
          {/* Active glow dot */}
          <span className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary dark:bg-[#34d399] transition-all duration-300 ${
            isBookings ? 'opacity-100 scale-100 shadow-[0_0_8px_var(--primary)]' : 'opacity-0 scale-50'
          }`} />
        </Link>

        {/* Central Create Listing FAB Route Button with double glow and cutout design */}
        <div className="relative -top-5 flex items-center justify-center">
          {/* Outer glowing halo */}
          <div className={`absolute w-15 h-15 rounded-full bg-primary/20 dark:bg-[#34d399]/20 blur-md transition-all duration-500 ${
            isCreateListing ? 'scale-125 opacity-100 animate-pulse' : 'scale-90 opacity-40 group-hover:scale-105'
          }`} />
          <Link
            href="/create-listing"
            className={`relative flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-br from-primary via-[#008f60] to-accent text-white shadow-[0_6px_20px_rgba(0,108,73,0.3)] dark:shadow-[0_8px_25px_rgba(52,211,153,0.4)] border-4 border-[#f8faf9] dark:border-[#080c0a] hover:scale-110 active:scale-90 transition-all duration-300 group`}
            aria-label="Post an item"
          >
            <Plus className={`h-6 w-6 stroke-[3px] text-white transition-all duration-500 ${
              isCreateListing ? 'rotate-[135deg] scale-110' : 'group-hover:rotate-90'
            }`} />
          </Link>
        </div>

        {/* Dashboard Route Button */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group relative w-14 ${
            isDashboard ? 'text-primary dark:text-[#34d399]' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Dashboard"
        >
          <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
            isDashboard 
              ? 'bg-primary/10 dark:bg-[#34d399]/15 scale-110 shadow-[0_4px_12px_rgba(0,108,73,0.08)]' 
              : 'bg-transparent group-hover:bg-muted/50 dark:group-hover:bg-white/5'
          }`}>
            <LayoutDashboard className={`h-5 w-5 transition-all duration-300 group-hover:scale-110 ${
              isDashboard ? 'stroke-[2.5px] text-primary dark:text-[#34d399]' : 'stroke-[2px]'
            }`} />
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 transition-all duration-300 ${
            isDashboard ? 'opacity-100 scale-100 font-extrabold' : 'opacity-70 scale-95'
          }`}>
            Console
          </span>
          {/* Active glow dot */}
          <span className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary dark:bg-[#34d399] transition-all duration-300 ${
            isDashboard ? 'opacity-100 scale-100 shadow-[0_0_8px_var(--primary)]' : 'opacity-0 scale-50'
          }`} />
        </Link>

        {/* Profile Route Button */}
        <Link
          href="/dashboard?tab=profile"
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-95 group relative w-14 ${
            isProfile ? 'text-primary dark:text-[#34d399]' : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Profile"
        >
          <div className="relative">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
              isProfile 
                ? 'bg-primary/10 dark:bg-[#34d399]/15 scale-110 shadow-[0_4px_12px_rgba(0,108,73,0.08)]' 
                : 'bg-transparent group-hover:bg-muted/50 dark:group-hover:bg-white/5'
            }`}>
              <User className={`h-5 w-5 transition-all duration-300 ${
                isProfile ? 'stroke-[2.5px] text-primary dark:text-[#34d399]' : 'stroke-[2px]'
              }`} />
            </div>
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white animate-pulse shadow-md border border-white dark:border-[#070c0a]">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 transition-all duration-300 ${
            isProfile ? 'opacity-100 scale-100 font-extrabold' : 'opacity-70 scale-95'
          }`}>
            Profile
          </span>
          {/* Active glow dot */}
          <span className={`absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary dark:bg-[#34d399] transition-all duration-300 ${
            isProfile ? 'opacity-100 scale-100 shadow-[0_0_8px_var(--primary)]' : 'opacity-0 scale-50'
          }`} />
        </Link>

      </div>
    </div>
  );
}

export default function MobileNav() {
  return (
    <Suspense fallback={null}>
      <MobileNavContent />
    </Suspense>
  );
}
