'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Settings, CreditCard, ClipboardList, MessageSquare } from 'lucide-react';
import { api } from '../../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [chatThreads, setChatThreads] = useState<any[]>([]);

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
    router.push('/');
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
    <nav className="floating-nav sticky top-3 mt-3">
      <div className="flex justify-between items-center px-4 md:px-8 py-3 max-w-7xl mx-auto w-full">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 group select-none transition-all active:scale-[0.98]"
          >
            <img 
              src="/logo.png" 
              alt="Lentive Logo" 
              className="h-8 w-8 rounded-lg object-contain select-none"
            />
            <span className="font-display text-xl sm:text-2xl font-black text-primary tracking-tight group-hover:brightness-110 transition-all">Lentive</span>
            <span className="hidden sm:inline-block ml-0.5 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
              hyperlocal
            </span>
          </Link>
        </div>

        {/* User Auth, theme & notifications icons */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Messages Link (User Only) */}
          {user && (
            <Link
              href="/chats"
              className="relative text-primary hover:bg-primary/10 p-2 rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center"
              aria-label="Messages"
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessagesCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
                  {unreadMessagesCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile avatar dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-white/50 dark:bg-black/25 pl-1 pr-2.5 py-1 hover:bg-muted hover:border-primary/20 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                  alt={user.name}
                  className="h-7 w-7 rounded-lg object-cover border border-border/20 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="hidden text-xs font-bold text-foreground md:inline">
                  {user.name.split(' ')[0]}
                </span>
                <span className="material-symbols-outlined text-[14px] text-muted-foreground group-hover:text-primary transition-colors mt-0.5 select-none">
                  keyboard_arrow_down
                </span>
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl animate-scaleIn z-50">
                  <div className="px-3 py-2 border-b border-border/40">
                    <p className="font-extrabold text-xs text-foreground truncate">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user.email}</p>
                  </div>
                  
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                    >
                      <User className="h-4 w-4 text-primary" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                    >
                      <User className="h-4 w-4 text-primary" />
                      My Profile
                    </Link>

                    <Link
                      href="/bookings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                    >
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Bookings console
                    </Link>

                    <Link
                      href="/payments"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                    >
                      <CreditCard className="h-4 w-4 text-primary" />
                      Escrow Payments
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setShowProfileDropdown(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                    >
                      <Settings className="h-4 w-4 text-primary" />
                      Settings & Location
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs hover:bg-rose-500/10 text-rose-500 transition-all duration-150"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="flex items-center justify-center px-3 py-1.5 border border-border/80 hover:bg-muted text-xs font-bold rounded-xl text-foreground transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center px-3.5 py-1.5 bg-primary hover:brightness-105 text-xs font-bold rounded-xl text-white transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
