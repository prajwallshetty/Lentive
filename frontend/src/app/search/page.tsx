'use client';

import React, { useEffect, useState } from 'react';
import { useListingStore } from '../../store/listingStore';
import ListingCard from '../../components/listing/ListingCard';
import CategoryBar from '../../components/CategoryBar';
import { ListingGridSkeleton } from '../../components/ui/Skeletons';
import { Search, Compass, SlidersHorizontal, MapPin, Sparkles, X, RotateCcw, Map } from 'lucide-react';
import { MOCK_LOCATIONS } from '../../lib/constants';
import Link from 'next/link';

export default function SearchPage() {
  const { listings, loading, error, filters, setFilters, resetFilters, fetchListings } = useListingStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const handleLocationChange = (locIndex: number) => {
    const selectedLoc = MOCK_LOCATIONS[locIndex];
    if (selectedLoc) {
      setFilters({ coordinates: selectedLoc.coordinates });
    }
  };

  const activeLocation = MOCK_LOCATIONS.find(
    (loc) => loc.coordinates[0] === filters.coordinates[0] && loc.coordinates[1] === filters.coordinates[1]
  ) || MOCK_LOCATIONS[0];

  return (
    <div className="flex flex-col gap-6 w-full mt-20 pb-20 md:pb-6">
      
      {/* Category Navigation Bar */}
      <CategoryBar
        selectedCategory={filters.category}
        setSelectedCategory={(cat) => setFilters({ category: cat })}
      />

      {/* Main Search Panel */}
      <div className="flex flex-col gap-4 bg-gradient-to-br from-white to-[#f8faf9] dark:from-[#101613] dark:to-[#080d0b] border border-[#cbd5d0] dark:border-white/10 p-6 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
        
        {/* Row 1: Search Input & Toggle Filters Button */}
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-grow flex items-center bg-card border border-border/40 p-1.5 rounded-2xl focus-within:border-primary/45 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({ query: e.target.value })}
              placeholder="Search listings by title, keywords, or tags..."
              className="w-full pl-11 pr-4 py-2.5 bg-transparent text-sm font-semibold rounded-xl focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            {filters.query && (
              <button
                onClick={() => setFilters({ query: '' })}
                className="absolute right-3 p-1 rounded-full hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 h-13 px-4 rounded-2xl border transition-all duration-200 active:scale-95 text-xs font-bold cursor-pointer select-none ${
              showFilters
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                : 'bg-card border-border/40 text-foreground hover:bg-muted hover:border-primary/20'
            }`}
          >
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Area */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/20 mt-2 animate-scaleIn">
            
            {/* Location Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Search Location
              </label>
              <select
                value={MOCK_LOCATIONS.findIndex(l => l.coordinates[0] === filters.coordinates[0] && l.coordinates[1] === filters.coordinates[1])}
                onChange={(e) => handleLocationChange(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 text-xs bg-muted/40 dark:bg-white/5 border border-border/40 dark:border-white/5 rounded-xl text-foreground font-semibold focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {MOCK_LOCATIONS.map((loc, idx) => (
                  <option key={idx} value={idx}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Distance Radius Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Search Radius
                </label>
                <span className="text-xs font-extrabold text-primary">{filters.distance} km</span>
              </div>
              <div className="flex items-center gap-3 h-10">
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={filters.distance}
                  onChange={(e) => setFilters({ distance: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-muted dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Price Per Day
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => setFilters({ minPrice: parseInt(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2.5 text-xs bg-muted/40 dark:bg-white/5 border border-border/40 dark:border-white/5 rounded-xl text-foreground font-semibold focus:outline-none focus:border-primary/50"
                  />
                </div>
                <span className="text-muted-foreground text-xs font-bold">—</span>
                <div className="relative flex-grow">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">₹</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice === 50000 ? '' : filters.maxPrice}
                    onChange={(e) => setFilters({ maxPrice: parseInt(e.target.value) || 50000 })}
                    className="w-full pl-7 pr-3 py-2.5 text-xs bg-muted/40 dark:bg-white/5 border border-border/40 dark:border-white/5 rounded-xl text-foreground font-semibold focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Row */}
            <div className="md:col-span-3 flex justify-end border-t border-border/20 pt-4 mt-2">
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-500 hover:text-rose-600 transition active:scale-95 cursor-pointer bg-rose-500/5 hover:bg-rose-500/10 rounded-xl border border-rose-500/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center mt-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-black text-foreground tracking-tight">Search Results</h2>
          <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            Showing listings near <span className="font-extrabold text-foreground">{activeLocation.name.split(' ')[0]}</span> within <span className="font-extrabold text-foreground">{filters.distance}km</span>
          </p>
        </div>
        {!loading && (
          <span className="text-xs font-bold text-muted-foreground bg-muted dark:bg-[#0d1210] border border-border/30 px-3.5 py-1.5 rounded-full select-none">
            {listings.length} matches found
          </span>
        )}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <ListingGridSkeleton count={8} />
      ) : listings.length === 0 ? (
        <div className="rounded-[28px] border border-border/25 bg-card p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <Compass className="h-10 w-10 text-muted-foreground animate-pulse" />
          <h4 className="font-bold text-base text-foreground mt-2">No matching listings found</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Try adjusting your search filters, expanding your radius, or clearing keywords to explore more options.
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

      {/* Floating Map View Button */}
      <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40">
        <Link
          href="/map"
          className="flex items-center gap-2 bg-foreground text-background dark:bg-foreground dark:text-background px-5 py-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 font-extrabold text-xs tracking-wider uppercase border border-border/10 cursor-pointer"
        >
          <Map className="h-4.5 w-4.5" />
          <span>Show Map</span>
        </Link>
      </div>

    </div>
  );
}
