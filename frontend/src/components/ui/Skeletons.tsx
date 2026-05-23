'use client';

import React from 'react';

export function ListingCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border/25 bg-card overflow-hidden flex flex-col shadow-xs animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-square w-full bg-muted" />
      
      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        <div className="flex items-center justify-between">
          <div className="h-4.5 bg-muted rounded-md w-3/5" />
          <div className="h-3 bg-muted rounded-full w-1/4" />
        </div>
        <div className="h-3 bg-muted rounded-md w-2/3" />
        <div className="h-3 bg-muted rounded-md w-1/2" />
        
        <div className="h-[1px] bg-border/20 my-2" />
        
        <div className="flex items-center justify-between mt-1">
          <div className="h-5 bg-muted rounded-md w-1/3" />
          <div className="h-6 bg-muted rounded-full w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListingDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 bg-muted rounded-md w-24 mb-6" />

      {/* Title skeleton */}
      <div className="h-9 bg-muted rounded-md w-2/3 mb-2" />
      <div className="h-4 bg-muted rounded-md w-1/3 mb-6" />

      {/* Image gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[350px] md:h-[450px] mb-8 rounded-3xl overflow-hidden">
        <div className="md:col-span-2 bg-muted h-full w-full" />
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="bg-muted flex-grow" />
          <div className="bg-muted flex-grow" />
        </div>
      </div>

      {/* Main split grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side detail info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center gap-4 border-b border-border/30 pb-6">
            <div className="h-12 w-12 bg-muted rounded-xl shrink-0" />
            <div className="w-full flex flex-col gap-1.5">
              <div className="h-4 bg-muted rounded-md w-1/4" />
              <div className="h-3 bg-muted rounded-md w-1/6" />
            </div>
          </div>

          <div className="flex flex-col gap-3 py-2">
            <div className="h-4 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-full" />
            <div className="h-4 bg-muted rounded-md w-4/5" />
          </div>

          <div className="border-t border-border/30 pt-6">
            <div className="h-6 bg-muted rounded-md w-1/3 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-muted rounded-2xl w-full" />
              <div className="h-12 bg-muted rounded-2xl w-full" />
            </div>
          </div>
        </div>

        {/* Right side booking card */}
        <div className="h-fit rounded-3xl border border-border/25 bg-card p-6 shadow-sm flex flex-col gap-4">
          <div className="h-6 bg-muted rounded-md w-1/3 mb-2" />
          <div className="h-12 bg-muted rounded-2xl w-full" />
          <div className="h-12 bg-muted rounded-2xl w-full" />
          <div className="h-10 bg-muted rounded-full w-full mt-2" />
        </div>
      </div>
    </div>
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/20 bg-card p-5 animate-pulse flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="h-16 w-16 bg-muted rounded-xl shrink-0" />
        <div className="flex-grow flex flex-col gap-1.5">
          <div className="h-4 bg-muted rounded-md w-2/3" />
          <div className="h-3 bg-muted rounded-md w-1/3" />
          <div className="h-3.5 bg-muted rounded-full w-20 mt-1" />
        </div>
      </div>
      <div className="h-[1px] bg-border/10 w-full" />
      <div className="flex justify-between items-center">
        <div className="h-4.5 bg-muted rounded-md w-24" />
        <div className="h-8 bg-muted rounded-xl w-28" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/20 bg-card p-5 flex flex-col gap-3">
          <div className="h-3.5 bg-muted rounded-md w-1/2" />
          <div className="h-8 bg-muted rounded-md w-2/3" />
          <div className="h-3 bg-muted rounded-md w-1/3" />
        </div>
      ))}
    </div>
  );
}
