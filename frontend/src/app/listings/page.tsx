'use client';

import React, { useEffect } from 'react';
import { useListingStore } from '../../store/listingStore';
import ListingCard from '../../components/listing/ListingCard';
import CategoryBar from '../../components/CategoryBar';
import { ListingGridSkeleton } from '../../components/ui/Skeletons';
import { Search, Compass } from 'lucide-react';

export default function ListingsPage() {
  const { listings, loading, error, filters, setFilters, fetchListings } = useListingStore();

  useEffect(() => {
    fetchListings();
  }, [filters.coordinates, filters.distance, filters.category, filters.query]);

  return (
    <div className="flex flex-col gap-6 w-full mt-20">
      {/* Category Navigation Bar */}
      <CategoryBar
        selectedCategory={filters.category}
        setSelectedCategory={(cat) => setFilters({ category: cat })}
      />

      {/* Inline Search Bar */}
      <div className="relative w-full max-w-2xl mx-auto flex items-center bg-card border border-border/40 p-2 rounded-2xl focus-within:border-primary/45 focus-within:ring-4 focus-within:ring-primary/5 transition-all duration-300 shadow-sm mt-2">
        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.query}
          onChange={(e) => setFilters({ query: e.target.value })}
          placeholder="Search listings by title, keywords, or tags..."
          className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold rounded-xl focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <h2 className="text-xl font-black text-foreground">Explore Catalog</h2>
        <span className="text-xs font-bold text-muted-foreground bg-muted dark:bg-[#0d1210] border border-border/30 px-3.5 py-1.5 rounded-full select-none">
          {listings.length} items available
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <ListingGridSkeleton count={8} />
      ) : listings.length === 0 ? (
        <div className="rounded-3xl border border-border/25 bg-card p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
          <Compass className="h-10 w-10 text-muted-foreground animate-pulse" />
          <h4 className="font-bold text-base text-foreground mt-2">No items found</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Expand your simulated search radius or update your filters to browse more local listings.
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
  );
}
