'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useListingStore } from '../store/listingStore';
import { MOCK_LOCATIONS } from '../lib/constants';
import ListingCard from '../components/listing/ListingCard';
import CategoryBar from '../components/CategoryBar';
import { ListingGridSkeleton } from '../components/ui/Skeletons';
import { Search, MapPin, Shield, Compass, Sparkles, Mail, Plus, Handshake, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, resendVerification } = useAuth();
  const { listings, loading, error, filters, setFilters, fetchListings } = useListingStore();
  const [resending, setResending] = React.useState(false);

  // Fetch listings on mount and when filters change
  useEffect(() => {
    fetchListings();
  }, [filters.coordinates, filters.distance, filters.category, filters.query]);

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

  const currentLocation = MOCK_LOCATIONS.find(
    (loc) => loc.coordinates[0] === filters.coordinates[0] && loc.coordinates[1] === filters.coordinates[1]
  ) || MOCK_LOCATIONS[0];

  return (
    <div className="flex flex-col gap-6 w-full mt-20">
      
      {/* Category Navigation Bar (Sticky beneath Navbar) */}
      <CategoryBar
        selectedCategory={filters.category}
        setSelectedCategory={(cat) => setFilters({ category: cat })}
      />

      {/* Email Verification Banner */}
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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-700 dark:text-amber-400">
          <Shield className="h-5 w-5 text-amber-500 shrink-0" />
          <span className="font-semibold">Backend Connection Issue: {error}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="rounded-[32px] bg-gradient-to-br from-white to-[#f5f8f6] dark:from-[#101613] dark:to-[#080d0b] border border-[#cbd5d0] dark:border-white/10 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[0_12px_36px_rgba(0,108,73,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Ambient background glows */}
        <div className="absolute right-[-20px] top-[-20px] h-72 w-72 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[-20px] bottom-[-20px] h-72 w-72 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-primary dark:text-[#34d399] mb-1">
            <Sparkles className="h-4.5 w-4.5 text-primary dark:text-[#34d399] fill-primary/10 dark:fill-primary/20 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Hyperlocal Sharing Economy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-2 leading-tight text-foreground">
            Rent anything, <span className="bg-gradient-to-r from-primary via-[#00a670] to-[#10b981] bg-clip-text text-transparent font-black">locally.</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-4 leading-relaxed max-w-lg">
            Connect instantly with verified owners in your neighborhood. Save money, reduce waste, and find high-quality tools, electronics, or outdoor gear right next door.
          </p>
        </div>

        {/* Instant Search Pill Container with focus ring and glassmorphic shadow */}
        <div className="relative w-full lg:max-w-md z-10 flex flex-col sm:flex-row items-center gap-2 bg-white/90 dark:bg-black/45 backdrop-blur-md p-2 rounded-2xl border border-[#cbd5d0] dark:border-white/10 focus-within:border-primary/40 focus-within:shadow-[0_12px_36px_rgba(0,108,73,0.08)] dark:focus-within:shadow-[0_12px_36px_rgba(0,0,0,0.4)] focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-md">
          <div className="relative w-full flex-grow">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors duration-300" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="What do you need today?"
              className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-semibold rounded-xl focus:outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
            />
          </div>
          
          {/* Location Context Badge inside search box */}
          <div className="flex items-center gap-1.5 bg-primary/5 dark:bg-[#34d399]/15 px-3.5 py-2.5 rounded-xl border border-primary/10 dark:border-[#34d399]/20 text-xs font-black text-primary dark:text-[#34d399] shrink-0 shadow-xs self-stretch justify-center select-none hover:bg-primary/10 dark:hover:bg-[#34d399]/25 transition duration-200 cursor-pointer">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{currentLocation.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>

      {/* Subtle emerald gradient line separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent my-2" />

      {/* Listings Grid */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-6 mt-1 text-foreground">
          <h3 className="text-2xl font-black tracking-tight text-foreground">Explore Nearby Listings</h3>
          {!loading && (
            <span className="text-xs font-bold text-muted-foreground bg-muted dark:bg-[#0d1210] border border-border/30 px-3.5 py-1.5 rounded-full select-none">
              Showing {listings.length} matches
            </span>
          )}
        </div>
        
        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-border/25 bg-card p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
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
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtle emerald gradient line separator */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/15 to-transparent my-2" />

      {/* Bento Grid Info Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-1">
        {/* Large Green Bento Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#006c49] via-[#005a3c] to-[#013f2a] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-xs group border border-primary/20 hover:shadow-[0_20px_40px_rgba(0,108,73,0.15)] transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 shrink-0 pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
            <Shield className="h-64 w-64 text-white" />
          </div>
          
          <div className="relative z-10 max-w-md">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Lentive SafeRent™ Guarantee</span>
            <h3 className="text-2xl font-black mt-2 leading-tight">Renting made simple and safe.</h3>
            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
              Every rental transaction includes basic coverage options, secure escrow payments, and fully verified user profiles. Share resources with complete peace of mind.
            </p>
          </div>
          
          <Link href="/verification" className="relative z-10 mt-6 px-5 py-2.5 bg-white text-[#006c49] hover:bg-emerald-50 hover:shadow-md hover:scale-[1.02] rounded-full text-xs font-bold w-fit transition-all duration-200 active:scale-95 cursor-pointer">
            Get Verified Now
          </Link>
        </div>

        {/* Small Neutral Bento Card */}
        <div className="bg-card border border-border/25 p-8 rounded-3xl flex flex-col justify-between min-h-[220px] shadow-xs hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-primary/20 transition-all duration-300 relative overflow-hidden group hover:-translate-y-0.5">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5 shrink-0 pointer-events-none transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
            <Handshake className="h-44 w-44 text-primary" />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Local Resources</span>
            <h3 className="text-xl font-black mt-2 leading-tight text-foreground">Build Community.</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Reduce consumer waste, save money on one-time tools, and meet friendly makers, campers, and builders right inside your neighborhood.
            </p>
          </div>
          
          <Link href="/verification" className="relative z-10 mt-6 flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all cursor-pointer select-none">
            <span>See how it works</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Desktop Only for posting listings */}
      <Link 
        href="/create-listing"
        className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 bg-gradient-to-tr from-primary to-accent hover:brightness-105 text-white px-4 py-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group active:scale-95 select-none border border-white/10"
        title="Post an Item for Rent"
      >
        <Plus className="h-5 w-5 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm whitespace-nowrap">
          Post an Item
        </span>
      </Link>

    </div>
  );
}
