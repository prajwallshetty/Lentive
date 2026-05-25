'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, Heart, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { predictTravelTimes, formatCurrency } from '../../lib/utils';
import { useListingStore } from '../../store/listingStore';
import { MOCK_LOCATIONS } from '../../lib/constants';

interface ListingCardProps {
  listing: any;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { filters } = useListingStore();

  // Find active location object in constants based on current store coordinates
  const currentLocation = MOCK_LOCATIONS.find(
    (loc) => loc.coordinates[0] === filters.coordinates[0] && loc.coordinates[1] === filters.coordinates[1]
  ) || MOCK_LOCATIONS[0];

  // Calculate travel predictions from simulated user location to listing coordinates
  const travel = listing.location && listing.location.coordinates
    ? predictTravelTimes(
        currentLocation.coordinates[1],
        currentLocation.coordinates[0],
        listing.location.coordinates[1],
        listing.location.coordinates[0]
      )
    : null;

  // Get first image or fallback
  const displayImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80';

  return (
    <Link
      href={`/listing/${listing._id || listing.id}`}
      className="group flex flex-col gap-3 rounded-[24px] bg-white border border-border/80 p-3 cursor-pointer relative overflow-hidden shadow-xs hover:shadow-lg hover:border-primary/25 transition-all duration-300 active:scale-[0.99] select-none hover:-translate-y-1"
    >
      {/* Listing Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-muted border border-border/10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        )}
        <img
          src={displayImage}
          alt={listing.title}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.06] ${
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
          loading="lazy"
        />
        
        {/* Category Badge overlay (top-left) */}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[9px] font-black text-primary border border-white/10 uppercase tracking-wider shadow-sm select-none">
          {listing.category}
        </span>

        {/* Favorite Bookmark Button overlay (top-right) */}
        <button
          onClick={(e) => {
            e.preventDefault(); // Don't trigger the Link navigation
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center border border-white/10 text-muted-foreground hover:text-rose-500 transition shadow-sm active:scale-75 z-10"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-foreground'
            }`}
          />
        </button>

        {/* Rating Badge overlay (bottom-left) */}
        {listing.ratings && listing.ratings.count > 0 && (
          <div className="absolute left-3 bottom-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-black text-amber-400 border border-white/10 shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
            <span>{listing.ratings.average.toFixed(1)}</span>
            <span className="text-white/40 font-normal">({listing.ratings.count})</span>
          </div>
        )}
      </div>

      {/* Listing Details */}
      <div className="flex flex-col flex-grow justify-between gap-2 px-1 pb-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {listing.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[130px] font-semibold">{listing.address.split(',')[0]}</span>
            {travel && (
              <>
                <span className="text-[10px] text-muted-foreground/40 font-black">•</span>
                <span className="font-black text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/10">{travel.distance}</span>
                <span className="text-[10px] text-muted-foreground/40 font-black">•</span>
                <span className="text-[9px] font-bold text-muted-foreground">🚗 {travel.driveMins}m</span>
              </>
            )}
          </div>
        </div>

        {/* Card Footer: Host details + Pricing/Rent FAB */}
        <div className="flex items-center justify-between border-t border-border/15 pt-2.5 mt-1">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold leading-none">Host</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-extrabold text-foreground truncate max-w-[90px]">
                  {listing.owner?.name?.split(' ')[0] || 'Local Owner'}
                </span>
                <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 fill-primary/5" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className="text-right">
              <span className="text-sm font-black text-primary">{formatCurrency(listing.pricePerDay)}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/day</span>
            </div>
            
            {/* Rent action element */}
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md transition duration-300 group-hover:scale-105 active:scale-95">
              <ArrowUpRight className="h-4 w-4 stroke-[2.5px]" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
