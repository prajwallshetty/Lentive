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
import { Search, MapPin, Shield, Compass, Sparkles, Mail, Plus, Handshake, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
  const [postFormOnLoad, setPostFormOnLoad] = useState(false);
  
  const { showToast } = useToast();

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

  const handleFABClick = () => {
    if (!user) {
      showToast('Please log in to post an item.', 'info');
      // Redirect to login page
      window.location.href = '/login';
      return;
    }
    // Switch to dashboard view, open the add listing form
    setCurrentView('dashboard');
    setPostFormOnLoad(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300 relative overflow-hidden">
      
      {/* Floating Header */}
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

          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 relative z-10">
            
            {/* Email Verification Warning Banner */}
            {user && !user.isVerified && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0 animate-pulse" />
                  <div>
                    <span className="font-extrabold text-rose-700 dark:text-rose-300 block sm:inline mr-1">Verify your email address:</span>
                    <span className="text-muted-foreground">Please check your inbox (or terminal logs) for the verification link to unlock full platform access.</span>
                  </div>
                </div>
                <button
                  disabled={resending}
                  onClick={handleResendVerification}
                  className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl transition disabled:opacity-50 shrink-0 self-start sm:self-center cursor-pointer shadow-sm"
                >
                  {resending ? 'Sending...' : 'Resend Verification'}
                </button>
              </div>
            )}

            {/* API Connection Warning */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-700 dark:text-amber-400 animate-pulse">
                <Shield className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Hero split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Left search block - 2 columns */}
              <div className="lg:col-span-2 rounded-3xl bg-card border border-border/40 p-8 flex flex-col justify-between gap-8 relative overflow-hidden shadow-sm">
                <div className="absolute right-0 top-0 h-52 w-52 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Sparkles className="h-4 w-4 text-primary fill-primary/10 animate-bounce" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest">Hyperlocal Sharing Economy</span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-1 max-w-lg leading-tight text-foreground">
                    Rent anything, <span className="text-primary font-black">locally.</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-3 max-w-md">
                    Connect instantly with verified owners in your community. Save money, reduce waste, and find the tools, electronics, or gear you need right next door.
                  </p>
                </div>

                {/* Instant Search Pill Container */}
                <div className="relative w-full z-10 flex flex-col sm:flex-row items-center gap-2.5 bg-muted/50 dark:bg-black/25 p-2 rounded-2xl border border-border/40 shadow-inner">
                  <div className="relative w-full flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tools, electronics, party supplies, camping gear..."
                      className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-semibold rounded-xl focus:outline-none transition-all placeholder:text-muted-foreground/75 text-foreground"
                    />
                  </div>
                  
                  {/* Location Context Badge inside search box */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-card px-3.5 py-2 rounded-full border border-border/30 text-xs font-bold text-primary shrink-0 shadow-sm self-stretch justify-center">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{currentLocation.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Right Lifestyle Card - 1 column */}
              <div className="rounded-3xl bg-card border border-border/40 overflow-hidden relative group min-h-[300px] lg:min-h-0 flex flex-col shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1571068316344-75bc76f77891?auto=format&fit=crop&w=800&q=80"
                  alt="Premium Electric Bike"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                
                {/* Glass Badge */}
                <div className="absolute top-4 right-4 rounded-full bg-white/90 dark:bg-[#161e1a]/95 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-extrabold text-primary border border-border/20 uppercase tracking-widest shadow-sm flex items-center gap-1.5 z-10">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                  Trending Now
                </div>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Details overlays */}
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4edea3] bg-primary/20 px-2 py-0.5 rounded w-fit border border-primary/30">Featured Rental</span>
                  <h4 className="text-lg font-black mt-1.5 leading-tight">Super73 Electric Bike</h4>
                  <p className="text-xs text-gray-200 mt-1">Rent for $45/day • 1.2 km away</p>
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-5 mt-2">
                <h3 className="text-xl font-black tracking-tight text-foreground">Featured Listings</h3>
                <span className="text-xs font-bold text-muted-foreground bg-muted dark:bg-card border border-border/30 px-3 py-1 rounded-full">Showing {listings.length} matches</span>
              </div>
              
              {listings.length === 0 ? (
                <div className="rounded-3xl border border-border/40 bg-card p-16 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
                  <Compass className="h-10 w-10 text-muted-foreground animate-pulse" />
                  <h4 className="font-bold text-base text-foreground mt-2">No listings found nearby</h4>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
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

            {/* Bento Grid Info Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Large Green Bento Card */}
              <div className="md:col-span-2 bg-[#006c49] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm group">
                <div className="absolute right-[-40px] bottom-[-40px] opacity-10 shrink-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                  <Shield className="h-64 w-64 text-white" />
                </div>
                
                <div className="relative z-10 max-w-md">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">Lentive SafeRent™ Guarantee</span>
                  <h3 className="text-2xl font-black mt-1 leading-tight">Renting made simple and safe.</h3>
                  <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                    Every rental transaction includes basic coverage options, secure escrow payments, and fully verified user profiles. Share resources with complete peace of mind.
                  </p>
                </div>
                
                <button className="relative z-10 mt-6 px-5 py-2.5 bg-white text-[#006c49] hover:bg-emerald-50 rounded-full text-xs font-bold w-fit transition shadow-sm active:scale-95 cursor-pointer">
                  Learn about safety
                </button>
              </div>

              {/* Small Neutral Bento Card */}
              <div className="bg-card border border-border/40 p-8 rounded-3xl flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-20px] bottom-[-20px] opacity-5 shrink-0 pointer-events-none transition-transform duration-700 group-hover:scale-110">
                  <Handshake className="h-44 w-44 text-primary" />
                </div>
                
                <div className="relative z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Local Resources</span>
                  <h3 className="text-lg font-black mt-1 leading-tight text-foreground">Build Community.</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Reduce consumer waste, save money on one-time tools, and meet friendly makers, campers, and builders right inside your neighborhood.
                  </p>
                </div>
                
                <div className="relative z-10 mt-6 flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all cursor-pointer">
                  <span>See how it works</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

          </main>
        </>
      ) : (
        /* Host/Renter Dashboard View */
        <div className="relative z-10 flex-grow">
          <DashboardView
            user={user}
            currentLocation={currentLocation}
            initialShowAddForm={postFormOnLoad}
            onCloseAddForm={() => setPostFormOnLoad(false)}
          />
        </div>
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

      {/* Floating Action Button (FAB) */}
      <div 
        onClick={handleFABClick}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:brightness-110 text-white px-4 py-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group active:scale-95 select-none border border-white/10"
        title="Post an Item for Rent"
      >
        <Plus className="h-5 w-5 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm whitespace-nowrap">
          Post an Item
        </span>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-white/60 dark:bg-card/65 backdrop-blur-md mt-auto py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
          <p>© 2026 Lentive. Hyperlocal Sharing Economy Marketplace Platform.</p>
          <p className="mt-1 text-[10px] text-muted-foreground/80">Built with Next.js, Express, MongoDB and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
