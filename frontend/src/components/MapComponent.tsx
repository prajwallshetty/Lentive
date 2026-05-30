'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { predictTravelTimes } from '../lib/utils';
import { Car, Bike, Footprints, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Import Leaflet CSS in the component
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center: [number, number]; // [lat, lng] for Leaflet
  zoom?: number;
  showRadius?: boolean;
  listings: any[];
  searchRadius?: number; // in km
  selectedListingId?: string | null;
  onMarkerClick?: (listing: any) => void;
  userLocation?: [number, number] | null; // [lat, lng]
}

// Helper to update map view dynamically when center coordinates change
function ChangeMapView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({
  center,
  zoom = 13,
  showRadius = true,
  listings,
  searchRadius = 10,
  selectedListingId = null,
  onMarkerClick,
  userLocation,
}: MapComponentProps) {
  
  // Custom pulsing user location marker icon
  const userIcon = typeof window !== 'undefined'
    ? L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center w-6 h-6">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-600 border-2 border-white shadow-md"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })
    : null;

  // Custom Airbnb-style price marker icon
  const createPriceIcon = (price: number, isSelected: boolean) => {
    if (typeof window === 'undefined') return null;
    
    const formattedPrice = price >= 1000 ? `₹${(price / 1000).toFixed(1)}k` : `₹${price}`;
    
    return L.divIcon({
      className: 'custom-price-marker',
      html: `
        <div class="flex items-center justify-center px-2.5 py-1.5 rounded-full text-[10px] font-black shadow-md border transition-all duration-300 transform hover:scale-110 select-none ${
          isSelected
            ? 'bg-primary text-white border-transparent scale-110 ring-4 ring-primary/20 z-[1000]'
            : 'bg-white dark:bg-neutral-900 text-foreground border-border dark:border-white/10 hover:border-primary'
        }">
          ${formattedPrice}
        </div>
      `,
      iconSize: [52, 28],
      iconAnchor: [26, 14],
    });
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={false} // Custom zoom controls or placed on bottom right to prevent overlaying
      >
        <ChangeMapView center={center} zoom={zoom} />
        
        {/* Map Tiles: Clean, modern light/dark mode tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* User Search Center / Active Geolocation Pin */}
        {userLocation && userIcon && (
          <Marker position={userLocation} icon={userIcon as L.DivIcon}>
            <Popup>
              <div className="p-1 text-center font-bold text-xs text-foreground">
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Search Radius Circular Helper Overlay */}
        {showRadius && (
          <Circle
            center={center}
            radius={searchRadius * 1000} // Convert km to meters
            pathOptions={{
              color: 'var(--primary)',
              fillColor: 'var(--primary)',
              fillOpacity: 0.04,
              weight: 1.5,
              dashArray: '5, 10',
            }}
          />
        )}

        {/* Nearby Listing Markers */}
        {listings.map((item) => {
          if (!item.location || !item.location.coordinates) return null;
          
          const itemLng = item.location.coordinates[0];
          const itemLat = item.location.coordinates[1];
          const isSelected = selectedListingId === (item._id || item.id);
          
          // predict travel details from search center to this listing
          const travel = predictTravelTimes(center[0], center[1], itemLat, itemLng);
          
          const icon = createPriceIcon(item.pricePerDay, isSelected);
          if (!icon) return null;

          return (
            <Marker
              key={item._id || item.id}
              position={[itemLat, itemLng]}
              icon={icon as L.DivIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(item);
                  }
                },
              }}
            >
              <Popup className="custom-leaflet-popup" maxWidth={260}>
                <div className="flex flex-col gap-2 p-1 font-sans">
                  {/* Thumbnail Image */}
                  <div className="relative w-full h-24 rounded-lg overflow-hidden bg-muted border border-border/10">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=300&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-primary/90 backdrop-blur-xs text-white text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                      {item.category}
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h4 className="font-extrabold text-xs text-foreground truncate">{item.title}</h4>
                    <p className="text-[10px] text-muted-foreground">{item.address || 'Hyperlocal'}</p>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xs font-black text-primary">₹{item.pricePerDay}</span>
                      <span className="text-[8px] text-muted-foreground">/ day</span>
                    </div>
                  </div>

                  {/* Travel Predictor Dashboard */}
                  <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1.5 rounded-lg border border-border/30 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <Car className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[8px] font-extrabold text-foreground">{travel.driveMins}m drive</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <Bike className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-[8px] font-extrabold text-foreground">{travel.bikeMins}m bike</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <Footprints className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[8px] font-extrabold text-foreground">{travel.walkMins}m walk</span>
                    </div>
                  </div>

                  {/* Details Link */}
                  <Link
                    href={`/listing/${item._id || item.id}`}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-black rounded-md transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
