'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_LOCATIONS, MockLocation } from '../lib/constants';
import { LogOut, User, Key, MapPin, X, Check, Menu } from 'lucide-react';
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
    <nav className="floating-nav">
      <div className="flex justify-between items-center px-4 md:px-8 py-3 max-w-7xl mx-auto">
        
        {/* Brand Logo & Menu Drawer Icon */}
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center justify-center text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-200 active:scale-90 cursor-pointer"
            onClick={() => showToast && showToast('Menu clicked (demo)', 'info')}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div 
            onClick={() => setCurrentView('browse')} 
            className="flex cursor-pointer items-center gap-2 group select-none transition-all active:scale-[0.98]"
          >
            <span className="font-display text-xl sm:text-2xl font-black text-primary tracking-tight group-hover:brightness-110 transition-all">lentive</span>
            <span className="ml-0.5 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary border border-primary/10">
              hyperlocal
            </span>
          </div>
        </div>

        {/* Hyperlocal Settings Bar (Pill Search/Filter Style) */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-border/60 bg-white/95 dark:bg-black/35 p-1 shadow-inner">
          
          {/* Location Picker */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLocationDropdown(!showLocationDropdown);
                setShowQuickLogin(false);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition cursor-pointer active:scale-95"
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span className="max-w-[120px] truncate">
                {currentLocation.name.split(' ')[0]}
              </span>
            </button>

            {showLocationDropdown && (
              <div className="absolute left-0 mt-3 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl animate-scaleIn z-50">
                <p className="px-3 py-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                  Simulate Location
                </p>
                <div className="my-1 border-t border-border/40" />
                <div className="max-h-[300px] overflow-y-auto pr-0.5 flex flex-col gap-0.5">
                  {MOCK_LOCATIONS.map((loc) => {
                    const isSelected = currentLocation.name === loc.name;
                    return (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setCurrentLocation(loc);
                          setShowLocationDropdown(false);
                        }}
                        className={`flex w-full items-start justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted transition-all duration-150 ${
                          isSelected ? 'bg-primary/5 font-bold text-primary' : 'text-foreground'
                        }`}
                      >
                        <div className="flex gap-2 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <div className="truncate">
                            <p className="font-bold text-[11px]">{loc.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[150px] mt-0.5">
                              {loc.address}
                            </p>
                          </div>
                        </div>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-border/50" />

          {/* Radius Filter Slider */}
          <div className="flex items-center gap-2.5 px-3.5 py-1">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Radius</span>
            <input
              type="range"
              min="1"
              max="25"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-20 accent-primary cursor-pointer h-1 rounded-lg bg-muted"
            />
            <span className="text-xs font-bold text-foreground w-8 text-right shrink-0">
              {radius}km
            </span>
          </div>
        </div>

        {/* Mobile-only Location Pill */}
        <div className="flex md:hidden items-center gap-1">
          <button
            onClick={() => {
              setShowLocationDropdown(true);
              setShowQuickLogin(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-muted/65 dark:bg-black/25 border border-border/40 rounded-full text-xs font-extrabold text-foreground transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
          >
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="max-w-[110px] truncate">
              {currentLocation.name.split(' ')[0]}
            </span>
          </button>
        </div>

        {/* User Auth, theme & notifications icons */}
        <div className="flex items-center gap-2 md:gap-3">
          
          {/* Desktop Navigation Link Shortcuts */}
          <div className="hidden md:flex gap-6 mr-3 items-center self-stretch">
            <button 
              onClick={() => setCurrentView('browse')} 
              className={`relative py-1.5 text-xs font-bold cursor-pointer transition-all duration-200 select-none ${currentView === 'browse' ? 'text-primary font-extrabold' : 'text-muted-foreground hover:text-primary'}`}
            >
              Home
              {currentView === 'browse' && (
                <span className="absolute bottom-[-10px] left-1 right-1 h-0.5 bg-primary rounded-full animate-scaleIn" />
              )}
            </button>
            <button 
              onClick={() => {
                if (user) {
                  setCurrentView('dashboard');
                } else {
                  window.location.href = '/login';
                }
              }} 
              className={`relative py-1.5 text-xs font-bold cursor-pointer transition-all duration-200 select-none ${currentView === 'dashboard' ? 'text-primary font-extrabold' : 'text-muted-foreground hover:text-primary'}`}
            >
              Dashboard
              {currentView === 'dashboard' && (
                <span className="absolute bottom-[-10px] left-1 right-1 h-0.5 bg-primary rounded-full animate-scaleIn" />
              )}
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className="text-primary hover:bg-primary/10 p-2 rounded-full transition-all duration-300 hover:rotate-12 active:scale-90 cursor-pointer flex items-center justify-center"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* User Profile trigger */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowQuickLogin(!showQuickLogin);
                  setShowLocationDropdown(false);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-border/40 bg-white/50 dark:bg-black/25 pl-1 pr-2.5 py-1 hover:bg-muted hover:border-primary/20 transition-all duration-200 cursor-pointer shadow-xs active:scale-95 group"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=40&h=40&q=80'}
                  alt={user.name}
                  className="h-7 w-7 rounded-lg object-cover border border-border/20 transition-transform duration-300 group-hover:scale-105"
                />
                <span className="hidden text-xs font-bold text-foreground sm:inline">
                  {user.name.split(' ')[0]}
                </span>
                <span className="material-symbols-outlined text-[14px] text-muted-foreground group-hover:text-primary transition-colors mt-0.5 select-none">
                  keyboard_arrow_down
                </span>
              </button>

              {showQuickLogin && (
                <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl animate-scaleIn z-50">
                  <p className="px-3 py-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">
                    Account Info
                  </p>
                  <div className="my-1 border-t border-border/40" />
                  
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setShowQuickLogin(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-muted text-foreground transition-all duration-150"
                  >
                    <User className="h-4 w-4 text-primary" />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setShowQuickLogin(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs hover:bg-rose-500/10 text-rose-500 transition-all duration-150"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
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

      {/* Mobile Location Selector Drawer */}
      {showLocationDropdown && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm bottom-sheet-overlay">
          <div className="w-full rounded-t-3xl bg-card border-t border-border/40 p-6 max-h-[85vh] overflow-y-auto bottom-sheet-content shadow-2xl relative">
            <div className="drag-handle" />
            
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                Select Simulated Location
              </h3>
              <button
                onClick={() => setShowLocationDropdown(false)}
                className="p-1 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              {MOCK_LOCATIONS.map((loc) => {
                const isSelected = currentLocation.name === loc.name;
                return (
                  <button
                    key={loc.name}
                    onClick={() => {
                      setCurrentLocation(loc);
                      setShowLocationDropdown(false);
                    }}
                    className={`flex w-full items-start justify-between gap-3 rounded-2xl p-3 text-left border transition-all duration-200 active:scale-[0.99] ${
                      isSelected 
                        ? 'border-primary/45 bg-primary/5 font-bold text-primary shadow-sm' 
                        : 'border-border/30 bg-muted/10 hover:bg-muted/30 text-foreground'
                    }`}
                  >
                    <div className="flex gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold">{loc.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                          {loc.address}
                        </p>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0 self-center" />}
                  </button>
                );
              })}
            </div>

            {/* Simulated Search Radius in Mobile bottom drawer */}
            <div className="mt-6 border-t border-border/30 pt-5 pb-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">Search Radius Limit</span>
                <span className="text-xs font-black text-primary bg-primary/10 border border-primary/25 px-2 py-0.5 rounded-md">
                  {radius} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[9px] text-muted-foreground mt-2 font-medium">
                Only show listings located within this distance from your simulated coordinates.
              </p>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}
