'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import CategoryBar from '../components/CategoryBar';
import ListingCard from '../components/ListingCard';
import ListingDetailModal from '../components/ListingDetailModal';
import DashboardView from '../components/DashboardView';
import { MOCK_LOCATIONS, MockLocation } from '../lib/constants';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Search, Map, List, Navigation, Shield, Compass, Sparkles, Mail } from 'lucide-react';

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<MockLocation>(MOCK_LOCATIONS[0]);
  const [radius, setRadius] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  
  const { user, logout, resendVerification, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'browse' | 'dashboard'>('browse');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resending, setResending] = useState(false);

  // Fetch Listings when Location, Radius, Category, or Query changes
  const fetchListings = async () => {
    try {
      const res = await api.listings.getAll({
        lng: currentLocation.coordinates[0],
        lat: currentLocation.coordinates[1],
        distance: radius,
        category: selectedCategory,
        query: searchQuery
      });
      setListings(res.listings || []);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Could not connect to the backend server. Please make sure the Express API is running.');
    }
  };

  useEffect(() => {
    fetchListings();
  }, [currentLocation, radius, selectedCategory, searchQuery]);

  const handleQuickLogin = async (email: string) => {
    // legacy mock quick-login bypass
  };

  const handleLogout = () => {
    logout();
    setCurrentView('browse');
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await resendVerification();
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300">
      {/* Translucent Sticky Navbar */}
      <Navbar
        currentLocation={currentLocation}
        setCurrentLocation={setCurrentLocation}
        radius={radius}
        setRadius={setRadius}
        isDark={isDark}
        setIsDark={setIsDark}
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onQuickLogin={handleQuickLogin}
        onLogout={handleLogout}
      />

      {currentView === 'browse' ? (
        <>
          {/* Categories Nav Header */}
          <CategoryBar
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
            
            {/* Email Verification Warning Banner */}
            {user && !user.isVerified && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-600 dark:text-rose-400 glass">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-bold block sm:inline mr-1">Verify your email address:</span>
                    <span className="text-muted-foreground dark:text-rose-300/80">Please check your inbox (or terminal logs) for the verification link to unlock listing items or full platform access.</span>
                  </div>
                </div>
                <button
                  disabled={resending}
                  onClick={handleResendVerification}
                  className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl transition disabled:opacity-50 shrink-0 self-start sm:self-center cursor-pointer shadow-md shadow-rose-500/20"
                >
                  {resending ? 'Sending...' : 'Resend Verification'}
                </button>
              </div>
            )}

            {/* API Connection Warning */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-600 dark:text-amber-400 animate-pulse">
                <Shield className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Hero search and map grid splits */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Left search block - 2 columns */}
              <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6 flex flex-col justify-between gap-6 shadow-sm overflow-hidden relative">
                <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-0 bottom-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-accent">
                    <Sparkles className="h-4 w-4 text-accent fill-accent animate-bounce" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Hyperlocal Rentals</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 max-w-md leading-tight text-foreground">
                    Rent anything, <span className="text-primary">right in your neighborhood.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-sm">
                    Connect instantly with local owners. Save money, reduce waste, and find items near you.
                  </p>
                </div>

                {/* Instant Search Control */}
                <div className="relative w-full z-10">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools, cameras, scooters, camping gear..."
                    className="w-full pl-11 pr-4 py-3 bg-secondary/60 text-sm font-semibold rounded-2xl border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Right Radar / Map block - 1 column */}
              <div className="rounded-3xl bg-card border border-border p-6 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-primary animate-spin-slow" />
                    <span className="text-xs font-bold tracking-tight text-foreground">Local Proximity Grid</span>
                  </div>
                  <span className="text-[10px] font-bold text-accent px-2 py-0.5 rounded-full bg-accent/10">
                    {listings.length} items found
                  </span>
                </div>

                {/* Simulated Radar Screen */}
                <div className="h-40 w-full rounded-2xl bg-secondary/50 border border-border relative flex items-center justify-center overflow-hidden">
                  
                  {/* Radar sweep lines */}
                  <div className="absolute inset-0 rounded-full border border-border/20 m-2" />
                  <div className="absolute inset-0 rounded-full border border-border/30 m-8 animate-ping" />
                  <div className="absolute inset-0 rounded-full border border-border/40 m-14" />
                  
                  {/* Crosshairs */}
                  <div className="absolute w-full h-[1px] bg-border/25" />
                  <div className="absolute h-full w-[1px] bg-border/25" />
                  
                  {/* Radar sweep light effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent animate-spin-slow pointer-events-none" />

                  {/* Simulated Center Point */}
                  <div className="absolute h-4 w-4 bg-accent/30 rounded-full flex items-center justify-center z-20">
                    <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
                  </div>

                  {/* Nearby pins layout */}
                  {listings.map((item, idx) => {
                    // Random placement around center based on indices
                    const angle = (idx * (360 / Math.max(listings.length, 1)) * Math.PI) / 180;
                    const r = 25 + (idx % 3) * 15; // random ring
                    const x = r * Math.cos(angle);
                    const y = r * Math.sin(angle);

                    return (
                      <div
                        key={item._id}
                        onClick={() => setSelectedListing(item)}
                        style={{ transform: `translate(${x}px, ${y}px)` }}
                        className="absolute h-6 w-6 bg-primary/20 rounded-full border border-primary hover:bg-accent/30 hover:border-accent flex items-center justify-center cursor-pointer transition z-10 group"
                      >
                        <Navigation className="h-2 w-2 text-primary group-hover:text-accent fill-current" />
                        <span className="absolute hidden group-hover:block bottom-7 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                          {item.title.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground z-10 leading-none">
                  <Map className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Showing items within <span className="font-semibold text-foreground">{radius}km</span> of your simulated coordinates.</span>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">Featured Listings</h3>
                <span className="text-xs text-muted-foreground">Showing {listings.length} matches</span>
              </div>
              
              {listings.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center gap-2">
                  <Compass className="h-10 w-10 text-muted-foreground animate-pulse" />
                  <h4 className="font-bold text-base text-foreground mt-2">No listings found nearby</h4>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Try expanding your search radius slider, selecting a different simulated location, or clearing search query filters.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {listings.map((item) => (
                    <ListingCard
                      key={item._id}
                      listing={item}
                      currentLocation={currentLocation}
                      onSelect={setSelectedListing}
                    />
                  ))}
                </div>
              )}
            </div>

          </main>
        </>
      ) : (
        /* Host/Renter Dashboard View */
        <DashboardView
          user={user}
          currentLocation={currentLocation}
        />
      )}

      {/* Item Detail Modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          user={user}
          onClose={() => setSelectedListing(null)}
          onBookingSuccess={fetchListings}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <p>© 2026 Lentive. Hyperlocal Sharing Economy Marketplace Platform.</p>
          <p className="mt-1 text-[10px]">Built with Next.js, Express, MongoDB and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
