'use client';

import React, { useState } from 'react';
import { Star, MapPin, Heart } from 'lucide-react';
import { calculateDistance, formatCurrency } from '../lib/utils';
import { MockLocation } from '../lib/constants';

interface ListingCardProps {
  listing: any;
  currentLocation: MockLocation;
  onSelect: (listing: any) => void;
}

export default function ListingCard({ listing, currentLocation, onSelect }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate distance from simulated user location to listing coordinates
  const distanceStr = listing.location && listing.location.coordinates
    ? calculateDistance(
        currentLocation.coordinates[1],
        currentLocation.coordinates[0],
        listing.location.coordinates[1],
        listing.location.coordinates[0]
      )
    : '';

  // Get first image or fallback
  const displayImage = listing.images && listing.images.length > 0
    ? listing.images[0]
    : 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group flex flex-col gap-3 rounded-[24px] bg-card border border-border/25 p-3 cursor-pointer relative overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_32px_rgba(0,108,73,0.06)] dark:hover:shadow-[0_16px_32px_rgba(0,0,0,0.45)] transition-all duration-300 active:scale-[0.98] select-none hover:-translate-y-0.5"
    >
      {/* Listing Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-muted border border-border/10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        )}
        <img
          src={displayImage}
          alt={listing.title}
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04] ${
            imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
          }`}
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 dark:bg-[#0d1210]/95 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold text-primary border border-border/10 uppercase tracking-wider shadow-sm select-none">
          {listing.category}
        </span>

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/95 dark:bg-[#0d1210]/95 backdrop-blur-md flex items-center justify-center border border-border/10 text-muted-foreground hover:text-rose-500 transition-all duration-200 shadow-sm active:scale-75"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-300 ${
              isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'text-foreground'
            }`}
          />
        </button>
      </div>

      {/* Listing Details */}
      <div className="flex flex-col flex-grow justify-between gap-2 px-1 pb-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors duration-300">
              {listing.title}
            </h3>
            {listing.ratings && listing.ratings.count > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded-md">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                <span>{listing.ratings.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[130px]">{listing.address.split(',')[0]}</span>
            {distanceStr && (
              <>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="font-extrabold text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/15">{distanceStr}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-1">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold leading-none">Host</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[90px] mt-0.5">
              {listing.owner?.name?.split(' ')[0] || 'Local Owner'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-sm sm:text-base font-black text-primary">{formatCurrency(listing.pricePerDay)}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/day</span>
            </div>
            
            {/* Rent action element */}
            <div className="h-8 px-4 rounded-full bg-primary hover:bg-[#005c3e] text-white flex items-center justify-center font-extrabold text-xs shadow-xs transition-all duration-300 group-hover:scale-105 active:scale-95 group-hover:shadow-[0_4px_12px_rgba(0,108,73,0.15)]">
              Rent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
