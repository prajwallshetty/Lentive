'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useListingStore } from '../../store/listingStore';
import { predictTravelTimes, formatCurrency } from '../../lib/utils';
import { MapPin, Search, Navigation, SlidersHorizontal, Loader2, ArrowLeft, Star, Car, Layers, X } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '../../lib/constants';

// Import MapComponent with SSR disabled
const MapComponent = dynamic(() => import('../../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest">
        Initializing Interactive Map...
      </p>
    </div>
  ),
});

export default function MapPage() {
  const { listings, loading, filters, setFilters } = useListingStore();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [searchVal, setSearchVal] = useState(filters.query);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Trigger search on component load
  useEffect(() => {
    setFilters({ coordinates: filters.coordinates });
  }, []);

  // Request browser geolocation on click
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        // Update store search center coordinates [lng, lat]
        setFilters({ coordinates: [longitude, latitude] });
        setLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location. Please check your browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Synchronize search text input with store filters
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ query: searchVal });
  };

  // Center coordinate mapping for leaflet is [lat, lng]
  // In store, coordinates are [lng, lat] (GeoJSON format)
  const mapCenter: [number, number] = [filters.coordinates[1], filters.coordinates[0]];

  return (
    <div className="w-full h-screen flex flex-col pt-[80px] md:pt-[96px] overflow-hidden bg-background relative z-0">
      
      {/* Desktop Search & Utility Bar: Hidden on Mobile to prevent duplicate inputs */}
      <div className="hidden md:flex bg-white dark:bg-neutral-900 border-b border-border/80 dark:border-white/5 py-3 px-6 justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors active:scale-95">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>
          <div>
            <h1 className="font-extrabold text-lg text-foreground tracking-tight leading-tight">Explore Hyperlocal Listings</h1>
            <p className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
              Radius: {filters.distance} km • {listings.length} nearby rentals
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-muted/65 hover:bg-muted/95 focus-within:bg-white border border-transparent focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 rounded-full px-4 py-1.5 transition-all duration-300">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input 
              type="text" 
              placeholder="Search items..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-semibold text-foreground placeholder:text-muted-foreground/60 w-48 ml-2"
            />
          </form>

          {/* Locate Button */}
          <button
            onClick={handleLocateUser}
            disabled={locating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary border border-primary/10 hover:bg-primary/20 rounded-full text-xs font-black uppercase tracking-wider transition-all select-none active:scale-95 disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5 fill-current" />
            )}
            <span>{locating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>
      </div>

      {/* Main Split / Layered Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Left Sidebar: Visible on md+ */}
        <div className="hidden md:flex md:w-[380px] bg-white dark:bg-neutral-900 border-r border-border/80 dark:border-white/5 flex-col h-full overflow-hidden shrink-0 z-10 shadow-lg">
          
          {/* Radius Slider Block */}
          <div className="p-4 border-b border-border/60 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
                Search radius
              </span>
              <span className="text-xs font-extrabold text-primary">{filters.distance} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={filters.distance}
              onChange={(e) => setFilters({ distance: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Categories Horizontal Selector inside Sidebar */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2 border-b border-border/60 dark:border-white/5 snap-x">
            <button
              onClick={() => setFilters({ category: 'All' })}
              className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider snap-start shrink-0 transition-colors ${
                filters.category === 'All'
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setFilters({ category: cat.name })}
                className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider snap-start shrink-0 transition-colors ${
                  filters.category === cat.name
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Searching listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <MapPin className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <h3 className="font-extrabold text-sm text-foreground">No listings found</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Try increasing your search radius or modifying filters.</p>
              </div>
            ) : (
              listings.map((item) => {
                const isSelected = selectedListingId === item._id;
                const itemLng = item.location?.coordinates?.[0];
                const itemLat = item.location?.coordinates?.[1];
                const travel = itemLat && itemLng
                  ? predictTravelTimes(mapCenter[0], mapCenter[1], itemLat, itemLng)
                  : null;

                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedListingId(item._id);
                      if (itemLng && itemLat) {
                        setFilters({ coordinates: [itemLng, itemLat] });
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-3 active:scale-[0.98] ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border/60 hover:border-primary/40 hover:bg-muted/10'
                    }`}
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/15 relative">
                      <img
                        src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=150&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-white/90 dark:bg-neutral-900/90 text-primary dark:text-[#34d399] font-black uppercase text-[7px] tracking-widest px-1 py-0.5 rounded-md border border-primary/10">
                        {item.category}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-extrabold text-xs text-foreground truncate leading-snug">{item.title}</h4>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="text-[9px] text-muted-foreground truncate">{item.address || 'Hyperlocal'}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-1">
                        <p className="text-xs font-black text-primary leading-none">
                          {formatCurrency(item.pricePerDay)}
                          <span className="text-[8px] text-muted-foreground font-semibold"> / day</span>
                        </p>
                        {travel && (
                          <div className="text-right shrink-0">
                            <span className="text-[9px] font-black text-foreground bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {travel.distance}
                            </span>
                            <span className="block text-[7px] text-muted-foreground font-extrabold uppercase mt-0.5">
                              🚗 {travel.driveMins} mins
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map Viewport Area: Full screen on mobile, absolute layout */}
        <div className="absolute inset-0 md:relative md:flex-1 h-full z-0">
          <MapComponent
            center={mapCenter}
            listings={listings}
            searchRadius={filters.distance}
            selectedListingId={selectedListingId}
            onMarkerClick={(item) => setSelectedListingId(item._id)}
            userLocation={userLocation}
          />
        </div>

        {/* MOBILE LAYOUT FLOATING OVERLAYS (md:hidden) */}
        
        {/* Mobile Top Floating Filter Capsule */}
        <div className="md:hidden absolute top-4 left-4 right-4 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-3 rounded-2xl border border-border/40 shadow-xl flex flex-col gap-2.5 transition-all duration-300">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-1.5 hover:bg-muted rounded-full transition-colors active:scale-90">
              <ArrowLeft className="h-4.5 w-4.5 text-foreground" />
            </Link>
            
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center bg-muted/65 focus-within:bg-white border border-transparent focus-within:border-primary/20 focus-within:ring-4 focus-within:ring-primary/5 rounded-full px-3 py-1.5 transition-all duration-300">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                placeholder="Search items..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] font-semibold text-foreground placeholder:text-muted-foreground/60 w-full ml-1.5"
              />
            </form>

            {/* GPS Button */}
            <button
              onClick={handleLocateUser}
              disabled={locating}
              className="p-2 bg-primary/10 text-primary border border-primary/10 hover:bg-primary/20 rounded-full transition-all active:scale-90 disabled:opacity-50"
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 fill-current" />
              )}
            </button>

            {/* Collapsible Slider Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`p-2 rounded-full border transition-all active:scale-90 ${
                showMobileFilters
                  ? 'bg-primary border-transparent text-white'
                  : 'bg-white dark:bg-neutral-900 border-border dark:border-white/10 text-foreground'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Collapsed Search Filters Panel */}
          {showMobileFilters && (
            <div className="pt-2 border-t border-border/40 space-y-3 animate-fadeInUp">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-muted-foreground">
                  <span>Search radius</span>
                  <span className="text-primary font-black">{filters.distance} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={filters.distance}
                  onChange={(e) => setFilters({ distance: parseInt(e.target.value) })}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Categories horizontally scrollable bar */}
              <div className="flex gap-1.5 overflow-x-auto hide-scrollbar snap-x py-1">
                <button
                  onClick={() => setFilters({ category: 'All' })}
                  className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider snap-start shrink-0 transition-colors ${
                    filters.category === 'All'
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setFilters({ category: cat.name })}
                    className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider snap-start shrink-0 transition-colors ${
                      filters.category === cat.name
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Listings swipeable carousel (at bottom) */}
        <div className="md:hidden fixed mobile-map-carousel left-0 right-0 z-10 pointer-events-none">
          <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 py-2 snap-x snap-mandatory scroll-px-4 pointer-events-auto">
            {listings.length === 0 ? (
              <div className="snap-center shrink-0 w-[290px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-xl text-center space-y-1">
                <p className="font-extrabold text-xs text-foreground">No listings nearby</p>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Try increasing search radius or adjust keywords.</p>
              </div>
            ) : (
              listings.map((item) => {
                const isSelected = selectedListingId === item._id;
                const itemLng = item.location?.coordinates?.[0];
                const itemLat = item.location?.coordinates?.[1];
                const travel = itemLat && itemLng
                  ? predictTravelTimes(mapCenter[0], mapCenter[1], itemLat, itemLng)
                  : null;

                return (
                  <div
                    key={item._id}
                    onClick={() => {
                      setSelectedListingId(item._id);
                      if (itemLng && itemLat) {
                        setFilters({ coordinates: [itemLng, itemLat] });
                      }
                    }}
                    className={`snap-center shrink-0 w-[290px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md p-2.5 rounded-2xl border flex gap-3 shadow-xl active:scale-[0.98] transition-all duration-300 ${
                      isSelected ? 'border-primary' : 'border-border/40'
                    }`}
                  >
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=150&q=80'}
                      alt=""
                      className="w-18 h-18 rounded-xl object-cover bg-muted shrink-0 border border-border/10"
                    />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="font-extrabold text-xs text-foreground truncate leading-snug">{item.title}</h4>
                        <p className="text-[9px] text-muted-foreground truncate">{item.address || 'Hyperlocal'}</p>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-black text-primary">{formatCurrency(item.pricePerDay)}/day</span>
                        {travel && (
                          <span className="text-[8px] font-extrabold text-muted-foreground flex items-center gap-0.5">
                            <Car className="h-3 w-3 text-primary" /> {travel.driveMins}m drive ({travel.distance})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
