'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_LOCATIONS, MockLocation } from '../lib/constants';
import { LogOut, User, Key, MapPin } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
  currentLocation: MockLocation;
  setCurrentLocation: (loc: MockLocation) => void;
  radius: number;
  setRadius: (r: number) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  user: any;
  currentView: 'browse' | 'dashboard';
  setCurrentView: (view: 'browse' | 'dashboard') => void;
  onQuickLogin: (email: string) => void;
  onLogout: () => void;
}

export default function Navbar({
  currentLocation,
  setCurrentLocation,
  radius,
  setRadius,
  isDark,
  setIsDark,
  user,
  currentView,
  setCurrentView,
  onQuickLogin,
  onLogout,
}: NavbarProps) {
  const { showToast } = useToast();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#161e1a]/85 backdrop-blur-md shadow-sm border-b border-border/40 transition-all">
      <div className="flex justify-between items-center px-4 md:px-16 py-3.5 max-w-7xl mx-auto">
        
        {/* Brand Logo & Menu Drawer Icon */}
        <div className="flex items-center gap-4">
          <button 
            className="material-symbols-outlined text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95 cursor-pointer"
            onClick={() => showToast && showToast('Menu clicked (demo)', 'info')}
          >
            menu
          </button>
          
          <div 
            onClick={() => setCurrentView('browse')} 
            className="flex cursor-pointer items-center gap-2 group select-none"
          >
            <span className="font-display text-2xl font-black text-primary tracking-tight">lentive</span>
            <span className="ml-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
              hyperlocal
            </span>
          </div>
        </div>

        {/* Hyperlocal Settings Bar (Pill Search/Filter Style) */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-border bg-white/90 dark:bg-black/30 p-1 shadow-sm">
          
          {/* Location Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowQuickLogin(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-base">location_on</span>
              <span className="max-w-[120px] truncate">
                {currentLocation.name.split(' ')[0]}
              </span>
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-2.5 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
                <p className="px-3 py-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  Simulate Location
                </p>
                <div className="my-1 border-t border-border" />
                {MOCK_LOCATIONS.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setCurrentLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted transition ${
                      currentLocation.name === loc.name ? 'bg-primary-container/20 font-bold text-primary' : 'text-foreground'
                    }`}
                  >
                    <span className="material-symbols-outlined text-primary text-sm mt-0.5 shrink-0">location_on</span>
                    <div>
                      <p className="font-semibold">{loc.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                        {loc.address}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-border" />

          {/* Radius Filter Slider */}
          <div className="flex items-center gap-2.5 px-3 py-1">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Radius</span>
            <input
              type="range"
              min="1"
              max="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-20 accent-primary cursor-pointer"
            />
            <span className="text-xs font-bold text-foreground w-8 text-right">
              {radius}km
            </span>
          </div>
        </div>

        {/* User Auth, theme & notifications icons */}
        <div className="flex items-center gap-3">
          
          {/* Desktop Navigation Link Shortcuts */}
          <div className="hidden md:flex gap-6 mr-4 items-center">
            <button 
              onClick={() => setCurrentView('browse')} 
              className={`text-xs font-semibold cursor-pointer transition-colors ${currentView === 'browse' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Home
            </button>
            <button 
              onClick={() => {
                if (user) {
                  setCurrentView('dashboard');
                } else {
                  // If not logged in, go to login
                  window.location.href = '/login';
                }
              }} 
              className={`text-xs font-semibold cursor-pointer transition-colors ${currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
            >
              Rentals
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="material-symbols-outlined text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? 'light_mode' : 'dark_mode'}
          </button>

          {/* Notifications Button */}
          <button className="material-symbols-outlined text-primary hover:bg-primary/10 p-2 rounded-full transition-colors active:scale-95 cursor-pointer">
            notifications
          </button>

          {/* User Profile trigger */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowQuickLogin(!showQuickLogin);
                  setShowLocationDropdown(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-border bg-white/50 dark:bg-black/20 p-1 hover:bg-muted transition cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                  alt={user.name}
                  className="h-7 w-7 rounded-lg object-cover border border-border"
                />
                <span className="hidden pr-2 text-xs font-bold text-foreground sm:inline">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {showQuickLogin && (
                <div className="absolute right-0 mt-2.5 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 z-50">
                  <p className="px-3 py-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                    Account Info
                  </p>
                  <div className="my-1 border-t border-border" />
                  
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setShowQuickLogin(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setShowQuickLogin(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-rose-500/10 text-rose-500 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-4 py-2 border border-border hover:bg-muted text-xs font-bold rounded-xl text-foreground transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 px-4 py-2 bg-primary hover:brightness-110 text-xs font-bold rounded-xl text-white transition shadow-sm cursor-pointer"
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
