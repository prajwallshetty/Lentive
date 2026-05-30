'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useListingStore } from '../../store/listingStore';
import { 
  Settings, User, MapPin, Eye, Shield, Key, HelpCircle, 
  Map, Sparkles, Loader2, ArrowLeft, Check, CheckCircle2 
} from 'lucide-react';

const LOCATION_PRESETS = [
  { name: 'Indiranagar (East)', coordinates: [77.6412, 12.9719], description: 'Startup hub, central commercial area' },
  { name: 'Koramangala (South)', coordinates: [77.6245, 12.9352], description: 'High density student and tech worker zone' },
  { name: 'Jayanagar (South-West)', coordinates: [77.5824, 12.9250], description: 'Quiet residential neighborhood' },
  { name: 'Whitefield (East)', coordinates: [77.7499, 12.9698], description: 'Major IT park and tech corridor' },
  { name: 'Malleshwaram (North-West)', coordinates: [77.5684, 12.9982], description: 'Traditional historic commercial center' },
  { name: 'Mangalore (Central)', coordinates: [74.8560, 12.9141], description: 'Port city commercial hub, coastal region' },
  { name: 'Manjeshwar (Kasaragod)', coordinates: [74.8876, 12.7161], description: 'Border town, educational and residential region' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const { filters, setFilters } = useListingStore();

  const [lng, setLng] = useState(filters.coordinates ? filters.coordinates[0] : 77.6412);
  const [lat, setLat] = useState(filters.coordinates ? filters.coordinates[1] : 12.9719);
  const [distance, setDistance] = useState(filters.distance);
  const [selectedPreset, setSelectedPreset] = useState('');

  // Sync state with store on load
  useEffect(() => {
    if (filters.coordinates) {
      setLng(filters.coordinates[0]);
      setLat(filters.coordinates[1]);
      
      // Check if current coordinates match a preset
      const preset = LOCATION_PRESETS.find(
        p => Math.abs(p.coordinates[0] - (filters.coordinates ? filters.coordinates[0] : 0)) < 0.0001 &&
             Math.abs(p.coordinates[1] - (filters.coordinates ? filters.coordinates[1] : 0)) < 0.0001
      );
      if (preset) {
        setSelectedPreset(preset.name);
      } else {
        setSelectedPreset('');
      }
    } else {
      setSelectedPreset('');
    }
    setDistance(filters.distance);
  }, [filters]);

  const handleApplyLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      coordinates: [lng, lat],
      distance: distance
    });
    showToast('Simulation location updated successfully. Nearby listings will refresh.', 'success');
  };

  const handleSelectPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setLng(preset.coordinates[0]);
    setLat(preset.coordinates[1]);
    setSelectedPreset(preset.name);
    
    setFilters({
      coordinates: preset.coordinates as [number, number]
    });
    showToast(`Simulation moved to ${preset.name}.`, 'success');
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-4 max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
          <Settings className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Sign in for settings</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Sign in to modify coordinates settings, adjust search radius, and configure trust verification preferences.
        </p>
        <Link
          href="/login?redirect=/settings"
          className="w-full py-3 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md shadow-primary/20 text-xs tracking-wide active:scale-95 cursor-pointer block text-center"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
      
      {/* Back button */}
      <Link 
        href="/profile" 
        className="flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground w-fit transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
          Configure simulated geolocation presets, developer tools, and account preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Settings categories */}
        <div className="md:col-span-1 flex flex-col gap-2.5">
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-primary flex items-center gap-2.5 text-xs font-extrabold">
            <Map className="h-4.5 w-4.5" />
            <span>Hyperlocal Geolocation</span>
          </div>
          
          <div className="p-4 rounded-2xl border border-border/30 bg-card hover:bg-muted/10 text-muted-foreground hover:text-foreground flex items-center gap-2.5 text-xs font-extrabold cursor-pointer transition-all">
            <User className="h-4.5 w-4.5" />
            <span>Profile Information</span>
          </div>

          <div className="p-4 rounded-2xl border border-border/30 bg-card hover:bg-muted/10 text-muted-foreground hover:text-foreground flex items-center gap-2.5 text-xs font-extrabold cursor-pointer transition-all">
            <Shield className="h-4.5 w-4.5" />
            <span>Trust & Verification</span>
          </div>

          <div className="p-4 rounded-2xl border border-border/30 bg-card hover:bg-muted/10 text-muted-foreground hover:text-foreground flex items-center gap-2.5 text-xs font-extrabold cursor-pointer transition-all">
            <Key className="h-4.5 w-4.5" />
            <span>Account Security</span>
          </div>
        </div>

        {/* Setting Panel Details */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Geolocation Section */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-5">
            <div>
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                Hyperlocal Geolocation Simulation
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold leading-relaxed">
                Configure your coordinates to simulate distance queries. In Lentive, searches calculate hyperlocal distance between listings and your coordinates.
              </p>
            </div>

            {/* Quick Presets Grid */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Active Preset Geocodes</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {LOCATION_PRESETS.map((preset) => {
                  const isActive = selectedPreset === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-2 group ${
                        isActive 
                          ? 'border-primary bg-primary/5 text-primary shadow-xs' 
                          : 'border-border/30 bg-muted/20 hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <MapPin className={`h-4.5 w-4.5 mt-0.5 shrink-0 transition-transform ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground/60 group-hover:scale-110'}`} />
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-extrabold leading-none">{preset.name}</p>
                          {isActive && <Check className="h-3 w-3 text-primary stroke-[3px]" />}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 font-semibold leading-tight">{preset.description}</p>
                        <p className="text-[8px] font-mono text-muted-foreground/80 mt-1 font-bold">
                          [{preset.coordinates[0]}, {preset.coordinates[1]}]
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Coordinates Form */}
            <form onSubmit={handleApplyLocation} className="border-t border-border/20 pt-4 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Custom Coordinates Override</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-foreground font-black uppercase">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={lng}
                    onChange={(e) => {
                      setLng(parseFloat(e.target.value));
                      setSelectedPreset('');
                    }}
                    className="rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground font-semibold font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-foreground font-black uppercase">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={lat}
                    onChange={(e) => {
                      setLat(parseFloat(e.target.value));
                      setSelectedPreset('');
                    }}
                    className="rounded-xl border border-border bg-muted/40 p-2.5 text-xs text-foreground font-semibold font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground font-black uppercase">Search Radius ({distance} km)</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={distance}
                  onChange={(e) => setDistance(parseInt(e.target.value))}
                  className="w-full accent-primary bg-muted/40 h-2 rounded-lg border border-border"
                />
              </div>

              <button
                type="submit"
                className="py-2.5 bg-primary hover:brightness-110 text-white font-extrabold rounded-xl transition-all duration-200 text-xs tracking-wide active:scale-95 cursor-pointer shadow-sm self-start px-6"
              >
                Apply Location Simulation
              </button>
            </form>
          </div>

          {/* Account Profile summary read-only */}
          <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-primary" />
              Developer Role Information
            </h3>

            <div className="flex flex-col gap-2.5 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between items-center">
                <span>Account Name</span>
                <span className="text-foreground font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Email Address</span>
                <span className="text-foreground font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verification State</span>
                <span className="text-foreground font-bold capitalize">{user.verificationStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Account Role</span>
                <span className="text-primary font-black uppercase text-[10px] tracking-wider">{user.role}</span>
              </div>
            </div>
            
            <div className="p-3 bg-muted/40 border border-border/20 rounded-2xl flex gap-2 text-[10px] text-muted-foreground leading-relaxed mt-1 font-semibold">
              <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>
                To change developer testing roles or verification permissions, access the **Admin Console** tab inside the dashboard workspace.
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
