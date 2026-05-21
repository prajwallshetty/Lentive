'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_LOCATIONS, MockLocation } from '../lib/constants';
import { MapPin, Sun, Moon, Shield, User, LogOut, Key } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

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
    <nav className="sticky top-0 z-50 w-full border-b border-border glass transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('browse')} 
          className="flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-lg shadow-accent/20">
            <span className="font-sans text-xl font-bold tracking-tighter">L</span>
          </div>
          <span className="hidden font-sans text-xl font-extrabold tracking-tight text-foreground sm:block">
            lentive
            <span className="ml-1 text-xs font-medium text-accent">hyperlocal</span>
          </span>
        </div>

        {/* Hyperlocal Settings Bar */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-sm sm:gap-4 md:p-1.5">
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowQuickLogin(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary rounded-full transition sm:text-sm"
            >
              <MapPin className="h-4 w-4 text-accent animate-pulse" />
              <span className="max-w-[120px] truncate sm:max-w-[180px]">
                {currentLocation.name.split(' ')[0]}
              </span>
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                <p className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
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
                    className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-xs sm:text-sm hover:bg-secondary transition ${
                      currentLocation.name === loc.name ? 'bg-secondary font-semibold' : ''
                    }`}
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">{loc.name}</p>
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

          {/* Radius Filter */}
          <div className="flex items-center gap-2 px-3 py-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase sm:text-xs">Radius</span>
            <input
              type="range"
              min="1"
              max="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-16 accent-accent cursor-pointer sm:w-24"
            />
            <span className="text-xs font-semibold text-foreground w-8 text-right">
              {radius}km
            </span>
          </div>
        </div>

        {/* User Auth and Theme Settings */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Switch */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView(currentView === 'dashboard' ? 'browse' : 'dashboard')}
                className={`hidden px-4 py-1.5 text-xs font-semibold rounded-xl border border-border hover:bg-secondary transition sm:block ${
                  currentView === 'dashboard' ? 'bg-secondary border-primary/50 text-primary' : 'bg-card text-foreground'
                }`}
              >
                {user.role === 'owner' ? 'Host Portal' : 'My Rentals'}
              </button>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowQuickLogin(!showQuickLogin);
                    setShowLocationDropdown(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 hover:bg-secondary transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                    alt={user.name}
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                  <span className="hidden pr-2 text-xs font-semibold text-foreground sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {showQuickLogin && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">
                    <p className="px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase">
                      Account Info
                    </p>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setShowQuickLogin(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs sm:text-sm hover:bg-secondary text-foreground transition"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowQuickLogin(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs sm:text-sm hover:bg-secondary text-destructive transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1 px-3 py-2 border border-border hover:bg-secondary text-xs font-bold rounded-xl text-foreground transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1 px-3 py-2 bg-primary hover:bg-primary/95 text-xs font-bold rounded-xl text-white transition shadow-md shadow-primary/10 cursor-pointer"
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
