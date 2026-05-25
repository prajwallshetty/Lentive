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
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
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
    <div className="flex flex-col gap-8 w-full mt-16">
      
      {/* Category Navigation Bar (Sticky beneath Navbar) */}
      <CategoryBar
        selectedCategory={filters.category}
        setSelectedCategory={(cat) => setFilters({ category: cat })}
      />

      {/* Email Verification Banner */}
      {user && !user.isVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50 border border-rose-150 text-xs sm:text-sm text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 shadow-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-extrabold text-rose-800 dark:text-rose-300 block sm:inline mr-1">Verify your email address:</span>
              <span className="text-muted-foreground">Please check your inbox (or terminal logs) for the verification link to unlock full access.</span>
            </div>
          </div>
          <button
            disabled={resending}
            onClick={handleResendVerification}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl transition disabled:opacity-50 shrink-0 self-start sm:self-center cursor-pointer shadow-sm"
          >
            {resending ? 'Sending...' : 'Resend Verification'}
          </button>
        </div>
      )}

      {/* API Connection Warning */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-xs sm:text-sm text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 shadow-sm">
          <Shield className="h-4.5 w-4.5 text-amber-600 shrink-0" />
          <span className="font-semibold">Backend Connection Issue: {error}</span>
        </div>
      )}

      {/* Immersive Apple-inspired Hero Banner */}
      <div className="relative rounded-[32px] bg-gradient-to-br from-white via-[#f7faf8] to-[#edf4f0] border border-border/80 p-8 md:p-12 lg:p-16 flex flex-col items-center text-center gap-8 overflow-hidden shadow-sm">
        {/* Ambient glow orbs */}
        <div className="absolute right-[-40px] top-[-40px] h-96 w-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-[-40px] bottom-[-40px] h-96 w-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl flex flex-col items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 fill-primary/10 text-primary animate-pulse" />
            <span>Hyperlocal Sharing Economy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mt-1 leading-tight text-foreground">
            Rent anything, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-black">right in your neighborhood.</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mt-1">
            Connect instantly with verified owners in your community. Save money, reduce waste, and find high-quality gear right next door.
          </p>
        </div>

        {/* Large Premium Search Widget */}
        <div className="relative w-full max-w-2xl z-10 bg-white/90 backdrop-blur-md p-2 rounded-2xl md:rounded-full border border-border shadow-lg flex flex-col md:flex-row items-center gap-2">
          
          {/* Text Search Input */}
          <div className="relative w-full flex-grow flex items-center pl-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="What do you need to rent today?"
              className="w-full pl-3 pr-4 py-3 bg-transparent text-xs font-semibold rounded-xl focus:outline-none placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>

          <div className="h-px md:h-8 w-full md:w-px bg-border/80 my-1 md:my-0" />

          {/* Location Chip */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted rounded-xl md:rounded-full border border-border/20 text-xs font-bold text-foreground shrink-0 shadow-xs hover:bg-muted/80 transition cursor-pointer select-none">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{currentLocation.name.split(' ')[0]}</span>
          </div>

          {/* Search Trigger CTA */}
          <button
            onClick={() => router.push(`/search?query=${encodeURIComponent(filters.query || '')}`)}
            className="w-full md:w-auto px-6 py-3 bg-primary hover:bg-primary/95 active:scale-98 text-white rounded-xl md:rounded-full text-xs font-extrabold transition shadow-sm"
          >
            Search Now
          </button>
        </div>

        {/* Trust metrics */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-[10px] uppercase font-black tracking-widest text-muted-foreground z-10 mt-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>100% Secure Escrow</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Verified Neighborhood Hosts</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span>SafeRent™ Guarantee</span>
          </div>
        </div>
      </div>

      {/* Grid Header & Counts */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-6 text-foreground">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-foreground">Explore Nearby Rentals</h3>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">Discover items available for pick up today near {currentLocation.name.split(',')[0]}</p>
          </div>
          {!loading && (
            <span className="text-xs font-bold text-muted-foreground bg-muted border border-border/30 px-3 py-1.5 rounded-full select-none shrink-0">
              {listings.length} matches found
            </span>
          )}
        </div>
        
        {/* Listings Grid */}
        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-16 text-center flex flex-col items-center justify-center gap-3">
            <Compass className="h-10 w-10 text-muted-foreground animate-pulse" />
            <h4 className="font-bold text-base text-foreground mt-2">No listings found nearby</h4>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Try expanding your search radius, selecting a different location, or clearing search query filters.
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

      {/* Trust & SafeRent Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Large Bento Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary via-[#047857] to-[#064e3b] text-white p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute right-[-40px] bottom-[-40px] opacity-10 shrink-0 pointer-events-none">
            <Shield className="h-64 w-64 text-white" />
          </div>
          
          <div className="relative z-10 max-w-md">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Lentive SafeRent™ Guarantee</span>
            <h3 className="text-2xl font-black mt-2 leading-tight">Renting made simple and safe.</h3>
            <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
              Every rental transaction includes security deposit escrow holds, local handover validation, verified user profiles, and built-in chat messaging. Share resources with complete peace of mind.
            </p>
          </div>
          
          <Link href="/verification" className="relative z-10 mt-6 px-5 py-2.5 bg-white text-primary hover:bg-emerald-50 hover:scale-[1.02] rounded-full text-xs font-bold w-fit transition active:scale-95 cursor-pointer">
            Get Verified Now
          </Link>
        </div>

        {/* Small Bento Card */}
        <div className="bg-white border border-border p-8 rounded-3xl flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-5 shrink-0 pointer-events-none group-hover:scale-105 transition-transform duration-500">
            <Handshake className="h-44 w-44 text-primary" />
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Local Resources</span>
            <h3 className="text-xl font-black mt-2 leading-tight text-foreground">Build community trust.</h3>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Reduce consumer waste, save money on one-time tools, and meet friendly makers, campers, and builders right inside your neighborhood.
            </p>
          </div>
          
          <Link href="/verification" className="relative z-10 mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2 transition-all cursor-pointer select-none">
            <span>See how it works</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Desktop Only */}
      <Link 
        href="/create-listing"
        className="hidden md:flex fixed bottom-6 right-6 z-50 items-center gap-2 bg-gradient-to-tr from-primary to-accent hover:brightness-105 text-white px-4 py-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer active:scale-95 select-none border border-white/10"
        title="Post an Item for Rent"
      >
        <Plus className="h-5 w-5 text-white" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-xs whitespace-nowrap">
          Post an Item
        </span>
      </Link>

    </div>
  );
}
