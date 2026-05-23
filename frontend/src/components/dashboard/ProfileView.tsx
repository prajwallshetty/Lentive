'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Listing } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { 
  User, Mail, ShieldAlert, ShieldCheck, MapPin, Award, Star, Settings, 
  LogOut, Plus, Trash2, Edit2, Loader2, Sparkles, ShoppingBag, Eye 
} from 'lucide-react';

export default function ProfileView() {
  const { user, logout } = useAuthStore();
  const { myListings, fetchMyListings } = useListingStore();
  const { showToast } = useToast();
  const [listingsLoading, setListingsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setListingsLoading(true);
      fetchMyListings().finally(() => setListingsLoading(false));
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return;
    try {
      const res = await api.listings.delete(listingId);
      if (res.success) {
        showToast('Listing deleted successfully.', 'success');
        fetchMyListings();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4 gap-4 max-w-md mx-auto">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Loading profile details...</p>
      </div>
    );
  }

  const averageRating = user.ratings?.average || 5.0;
  const ratingCount = user.ratings?.count || 0;
  const isVerified = user.isVerified || user.verificationStatus === 'approved';

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border border-background shadow-sm" title="Verified Account">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-foreground">{user.name}</h1>
              <span className="px-2.5 py-0.5 bg-muted/65 border border-border/20 rounded-md text-[9px] font-black text-muted-foreground uppercase self-center tracking-wider">
                {user.role}
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              {user.email}
            </p>

            <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {user.address || 'Bengaluru, India'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-center shrink-0">
          <Link
            href="/settings"
            className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 bg-muted/65 border border-border/30 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 active:scale-95 text-xs font-bold"
            title="Account Settings"
          >
            <Settings className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden md:inline ml-1.5 font-extrabold text-xs">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-10 w-10 md:w-auto md:px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 rounded-xl transition-all duration-200 active:scale-95 text-xs font-bold cursor-pointer"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            <span className="hidden md:inline ml-1.5 font-extrabold text-xs">Log Out</span>
          </button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verification Status Card */}
        <div className="rounded-3xl border border-border/40 bg-card p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Trust & Safety</h3>
          
          <div className="flex items-center gap-3 bg-muted/20 border border-border/20 p-4 rounded-2xl">
            {isVerified ? (
              <>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-foreground">Verified Member</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Fully verified credentials.</p>
                </div>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-xs font-extrabold text-foreground">Pending Verification</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Upload ID documents in Overview page.</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-2">
            <span className="text-xs text-muted-foreground font-semibold">Community Rating</span>
            <div className="flex items-center gap-1">
              <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-500" />
              <span className="text-sm font-black text-foreground">{averageRating.toFixed(1)}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">({ratingCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Statistics highlights */}
        <div className="rounded-3xl border border-border/40 bg-card p-5 shadow-sm flex flex-col gap-4 md:col-span-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Marketplace Analytics</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            <div className="bg-muted/20 border border-border/20 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold mb-1">
                <ShoppingBag className="h-4 w-4" />
                <span>My Listings</span>
              </div>
              <p className="text-2xl font-black text-foreground">{myListings.length}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold">Items listed in catalogue</p>
            </div>

            <div className="bg-muted/20 border border-border/20 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold mb-1">
                <Award className="h-4 w-4" />
                <span>Verification</span>
              </div>
              <p className="text-sm font-black text-foreground uppercase mt-1">
                {user.verificationStatus === 'none' ? 'NOT SUBMITTED' : user.verificationStatus}
              </p>
              <p className="text-[9px] text-muted-foreground mt-1.5 font-semibold">ID documents review state</p>
            </div>

            <div className="bg-muted/20 border border-border/20 p-4 rounded-2xl col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold mb-1">
                <Sparkles className="h-4 w-4" />
                <span>Rating Stats</span>
              </div>
              <p className="text-2xl font-black text-foreground">{averageRating.toFixed(1)} ★</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 font-semibold">Based on reviews received</p>
            </div>

          </div>
        </div>
      </div>

      {/* Inventory Listings Grid Section */}
      <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/20 pb-4 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground">My Inventory ({myListings.length})</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">Manage your public listings catalogue.</p>
          </div>
        </div>

        {listingsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <p className="text-xs font-bold text-muted-foreground">Loading items...</p>
          </div>
        ) : myListings.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 border border-border/20">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-xs text-foreground">No Items Listed</h4>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              Earn extra income by renting out your idle equipment, tools, electronics, or outdoor gear to neighbors.
            </p>
            <Link
              href="/create-listing"
              className="mt-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl"
            >
              Post First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myListings.map((l) => (
              <div 
                key={l._id} 
                className="group rounded-2xl border border-border/30 bg-muted/10 p-3.5 flex flex-col gap-3.5 hover:border-primary/25 transition-all duration-300 relative"
              >
                {/* Images */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/10 shrink-0">
                  <img
                    src={l.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&h=250&q=80'}
                    alt={l.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-xs border border-border/20 px-2 py-0.5 rounded-lg text-[9px] font-black text-foreground">
                    {formatCurrency(l.pricePerDay)}/day
                  </div>
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between gap-2.5">
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary truncate transition-colors">{l.title}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 font-semibold leading-relaxed">{l.description}</p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 border-t border-border/20 pt-3 mt-1 text-[10px] font-bold text-foreground">
                    <Link
                      href={`/listing/${l._id}`}
                      className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-muted/65 hover:bg-muted border border-border/20 rounded-lg text-[10px]"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      View
                    </Link>
                    <Link
                      href={`/edit-listing/${l._id}`}
                      className="flex-grow flex items-center justify-center gap-1 py-1.5 bg-muted/65 hover:bg-muted border border-border/20 rounded-lg text-[10px]"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-primary" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(l._id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 text-rose-500 rounded-lg cursor-pointer"
                      title="Delete listing"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
