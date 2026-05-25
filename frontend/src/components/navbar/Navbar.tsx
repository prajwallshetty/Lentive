'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useListingStore } from '../../store/listingStore';
import { LogOut, User, Settings, CreditCard, ClipboardList, MessageSquare, Menu, X, Search, Bell, Sparkles, Plus, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { filters, setFilters } = useListingStore();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [chatThreads, setChatThreads] = useState<any[]>([]);
  const [searchVal, setSearchVal] = useState(filters.query || '');

  // Sync searchVal with global store filters
  useEffect(() => {
    setSearchVal(filters.query || '');
  }, [filters.query]);

  // Sync and poll chats on mount/auth
  useEffect(() => {
    if (user) {
      const fetchChats = async () => {
        try {
          const res = await api.chats.getAll();
          setChatThreads(res.chats || res.data || []);
        } catch (err) {
          console.error('Failed to load navbar chats:', err);
        }
      };
      fetchChats();
      const interval = setInterval(fetchChats, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    } else {
      setChatThreads([]);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    setShowMobileDrawer(false);
    router.push('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ query: searchVal });
    router.push(`/search?query=${encodeURIComponent(searchVal)}`);
  };

  // Calculate total unread messages count
  const unreadMessagesCount = chatThreads.reduce((acc, thread) => {
    const unreadInThread = thread.messages?.filter((msg: any) => {
      const msgSenderId = msg.sender?._id || msg.sender;
      return msgSenderId !== user?.id && msgSenderId !== user?._id && !msg.isRead;
    }).length || 0;
    return acc + unreadInThread;
  }, 0);

  return (
    <>
      <nav className="floating-nav sticky top-3 mt-3 border border-border/80 dark:border-white/10 shadow-lg bg-white/90 backdrop-blur-md z-50">
        <div className="flex justify-between items-center px-4 md:px-6 py-2.5 max-w-7xl mx-auto w-full">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 group select-none transition-all active:scale-[0.98]"
            >
              <span className="font-sans text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-all">Lentive</span>
              <span className="hidden sm:inline-block ml-0.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
                hyperlocal
              </span>
            </Link>
          </div>


          {/* Desktop Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex items-center gap-2 max-w-md w-full mx-4 bg-muted/65 hover:bg-muted/95 focus-within:bg-white border border-transparent focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 rounded-full px-4 py-1.5 transition-all duration-300"
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tools, cameras, vehicles..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-xs font-semibold text-foreground placeholder:text-muted-foreground/60"
            />
            {searchVal && (
              <button 
                type="button" 
                onClick={() => { setSearchVal(''); setFilters({ query: '' }); }}
                className="text-muted-foreground hover:text-foreground text-[10px]"
              >
                ✕
              </button>
            )}
          </form>

          {/* Desktop Quick Categories / Menu */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-bold text-muted-foreground mr-4">
            <Link href="/" className="hover:text-primary transition-colors">Browse</Link>
            <Link href="/search?category=Tools" className="hover:text-primary transition-colors">Tools</Link>
            <Link href="/search?category=Electronics" className="hover:text-primary transition-colors">Electronics</Link>
            <Link href="/search?category=Vehicles" className="hover:text-primary transition-colors">Vehicles</Link>
          </div>

          {/* Actions & Profiles */}
          <div className="flex items-center gap-2.5">
            {/* Messages Link */}
            {user && (
              <Link
                href="/chats"
                className="relative text-foreground hover:bg-muted p-2 rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center border border-border/20 bg-white"
                aria-label="Messages"
              >
                <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
                {unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </Link>
            )}

            {/* Desktop User Menu */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 rounded-full border border-border/55 bg-white pl-1.5 pr-3 py-1 hover:bg-muted transition-all cursor-pointer shadow-xs active:scale-95 group"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                    alt={user.name}
                    className="h-6.5 w-6.5 rounded-full object-cover border border-border/20 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-xs font-bold text-foreground">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors mt-0.5 select-none">
                    ▼
                  </span>
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-scaleIn z-50">
                    <div className="px-3 py-2 border-b border-border/40">
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-xs text-foreground truncate">{user.name}</span>
                        {user.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                    
                    <div className="flex flex-col gap-0.5 mt-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all font-bold"
                      >
                        <User className="h-4 w-4 text-primary" />
                        Dashboard console
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all font-bold"
                      >
                        <User className="h-4 w-4 text-primary" />
                        My Profile
                      </Link>

                      <Link
                        href="/bookings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all font-bold"
                      >
                        <ClipboardList className="h-4 w-4 text-primary" />
                        Bookings Console
                      </Link>

                      <Link
                        href="/payments"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all font-bold"
                      >
                        <CreditCard className="h-4 w-4 text-primary" />
                        Escrow Payments
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all font-bold"
                      >
                        <Settings className="h-4 w-4 text-primary" />
                        Settings & Location
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-rose-500/10 text-rose-500 transition-all font-bold"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-3.5 py-1.5 border border-border/80 hover:bg-muted text-xs font-bold rounded-xl text-foreground transition active:scale-95"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center justify-center px-4 py-1.5 bg-primary hover:brightness-105 text-xs font-bold rounded-xl text-white transition active:scale-95 shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="flex md:hidden items-center justify-center p-2 rounded-full border border-border bg-white text-muted-foreground hover:text-foreground active:scale-90 transition-all"
              aria-label="Menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer (Sidebar) */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setShowMobileDrawer(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer container */}
          <div className="relative w-72 h-full bg-white/95 backdrop-blur-md shadow-2xl border-l border-border/40 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300 z-10">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border/20 pb-4 mb-5">
                <span className="font-extrabold text-sm text-foreground uppercase tracking-wider">Navigation Menu</span>
                <button 
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground active:scale-75 transition-all"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* User Profile Summary */}
              {user ? (
                <div className="p-4 rounded-2xl border border-border/30 bg-muted/30 flex items-center gap-3 mb-5">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                    alt={user.name}
                    className="h-10 w-10 rounded-xl object-cover border border-border/20 bg-muted"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-xs text-foreground truncate">{user.name}</span>
                      {user.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <span className="text-[9px] text-muted-foreground truncate block mt-0.5">{user.email}</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mb-5">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Account</p>
                  <Link 
                    href="/login"
                    onClick={() => setShowMobileDrawer(false)}
                    className="w-full py-2.5 border border-border text-center rounded-xl font-extrabold text-xs text-foreground bg-white"
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/signup"
                    onClick={() => setShowMobileDrawer(false)}
                    className="w-full py-2.5 bg-primary text-white text-center rounded-xl font-extrabold text-xs"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Links list */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">Explore Lentive</p>
                <Link
                  href="/"
                  onClick={() => setShowMobileDrawer(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  Explore listings
                </Link>
                <Link
                  href="/search"
                  onClick={() => setShowMobileDrawer(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/search' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                >
                  <Search className="h-4.5 w-4.5" />
                  Advanced Search
                </Link>

                {user && (
                  <>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-4 mb-2">Dashboard</p>
                    <Link
                      href="/dashboard"
                      onClick={() => setShowMobileDrawer(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/dashboard' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    >
                      <User className="h-4.5 w-4.5" />
                      Dashboard
                    </Link>
                    <Link
                      href="/bookings"
                      onClick={() => setShowMobileDrawer(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/bookings' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    >
                      <ClipboardList className="h-4.5 w-4.5" />
                      Bookings console
                    </Link>
                    <Link
                      href="/payments"
                      onClick={() => setShowMobileDrawer(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/payments' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    >
                      <CreditCard className="h-4.5 w-4.5" />
                      Escrow Payments
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowMobileDrawer(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-muted ${pathname === '/settings' ? 'text-primary bg-primary/5' : 'text-foreground'}`}
                    >
                      <Settings className="h-4.5 w-4.5" />
                      Settings & Location
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Logout Footer */}
            {user && (
              <button
                onClick={handleLogout}
                className="w-full py-3 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all mt-auto"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
