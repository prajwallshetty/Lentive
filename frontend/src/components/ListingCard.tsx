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
      className="group flex flex-col gap-3 rounded-3xl m3-card p-3 cursor-pointer relative overflow-hidden"
    >
      {/* Listing Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border border-border/40">
        <img
          src={displayImage}
          alt={listing.title}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 dark:bg-[#161e1a]/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-primary border border-border/20 uppercase tracking-wider shadow-sm">
          {listing.category}
        </span>

        {/* Favorite Bookmark Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute right-3 top-3 h-8 w-8 rounded-full bg-white/95 dark:bg-[#161e1a]/95 backdrop-blur-md flex items-center justify-center border border-border/20 text-muted-foreground hover:text-rose-500 transition-colors shadow-sm active:scale-90"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-foreground'
            }`}
          />
        </button>
      </div>

      {/* Listing Details */}
      <div className="flex flex-col flex-grow justify-between gap-2.5 px-1 py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors duration-200">
              {listing.title}
            </h3>
            {listing.ratings && listing.ratings.count > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 text-xs font-bold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{listing.ratings.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate max-w-[150px]">{listing.address}</span>
            {distanceStr && (
              <>
                <span className="text-[10px] text-muted-foreground/50">•</span>
                <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/20">{distanceStr}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground leading-none">Host</span>
            <span className="text-xs font-bold text-foreground truncate max-w-[100px] mt-0.5">
              {listing.owner?.name?.split(' ')[0] || 'Local Owner'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-base font-black text-primary">{formatCurrency(listing.pricePerDay)}</span>
              <span className="text-[10px] font-bold text-muted-foreground">/day</span>
            </div>
            
            {/* Rent action element */}
            <div className="h-8 px-3 rounded-full bg-primary hover:brightness-110 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-200 group-hover:shadow-md active:scale-95">
              Rent
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
