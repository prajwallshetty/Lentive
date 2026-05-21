'use client';

import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { calculateDistance, formatCurrency } from '../lib/utils';
import { MockLocation } from '../lib/constants';

interface ListingCardProps {
  listing: any;
  currentLocation: MockLocation;
  onSelect: (listing: any) => void;
}

export default function ListingCard({ listing, currentLocation, onSelect }: ListingCardProps) {
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
      className="group flex flex-col gap-3 rounded-2xl bg-card border border-border p-3 shadow-sm hover:shadow-xl hover:border-muted-foreground/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5"
    >
      {/* Listing Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary">
        <img
          src={displayImage}
          alt={listing.title}
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className="absolute left-3 top-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
          {listing.category}
        </span>
      </div>

      {/* Listing Details */}
      <div className="flex flex-col flex-grow justify-between gap-1.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition">
              {listing.title}
            </h3>
            {listing.ratings && listing.ratings.count > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 text-xs font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{listing.ratings.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-accent/80" />
            <span className="truncate max-w-[170px]">{listing.address}</span>
            {distanceStr && (
              <>
                <span className="text-[10px]">•</span>
                <span className="font-semibold text-accent">{distanceStr}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between border-t border-border/60 pt-2 mt-1">
          <div className="text-xs text-muted-foreground leading-none">
            Owner: <span className="font-semibold text-foreground">{listing.owner?.name?.split(' ')[0] || 'Unknown'}</span>
          </div>
          <div className="text-right">
            <span className="text-base font-extrabold text-foreground">{formatCurrency(listing.pricePerDay)}</span>
            <span className="text-[10px] font-medium text-muted-foreground"> / day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
