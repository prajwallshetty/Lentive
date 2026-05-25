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
  LogOut, Plus, Trash2, Edit2, Loader2, Sparkles, ShoppingBag, Eye,
  Lock, CheckCircle2, ChevronRight, BadgeCheck
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
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 gap-4 max-w-md mx-auto">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-muted-foreground">Syncing user profile metadata...</p>
      </div>
    );
  }

  const averageRating = user.ratings?.average || 5.0;
  const ratingCount = user.ratings?.count || 0;
  const isVerified = user.isVerified || user.verificationStatus === 'approved';

  const getVerificationStepStatus = (step: number) => {
    if (step === 1) {
      return user.isVerified && user.isPhoneVerified ? 'complete' : 'pending';
    }
    if (step === 2) {
      return user.verificationStatus === 'approved' ? 'complete' : user.verificationStatus === 'pending' ? 'review' : 'locked';
    }
    if (step === 3) {
      return user.drivingLicenseStatus === 'approved' ? 'complete' : user.drivingLicenseStatus === 'pending' ? 'review' : 'locked';
    }
    return 'locked';
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Background Decorative Blob */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          <div className="relative shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'}
              alt={user.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-[#f6faf8] shadow-md"
            />
            {isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Verified Account">
                <ShieldCheck className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-foreground tracking-tight">{user.name}</h1>
              <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[9px] font-black text-primary uppercase self-center tracking-wider w-fit mx-auto sm:mx-0">
                {user.role}
              </span>
            </div>

            <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-2">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              {user.email}
            </p>

            <p className="text-xs text-muted-foreground font-semibold flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              {user.address || 'Bengaluru, India'}
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 justify-center shrink-0 border-t border-border/40 pt-4 md:border-t-0 md:pt-0">
          <Link
            href="/settings"
            className="flex items-center justify-center h-10 px-4 bg-white border border-border/80 hover:bg-[#f8faf9] text-foreground rounded-xl transition-all duration-200 active:scale-95 text-xs font-black"
          >
            <Settings className="h-4 w-4 shrink-0 text-muted-foreground mr-1.5" />
            Edit Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center h-10 px-4 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl transition-all duration-200 active:scale-95 text-xs font-black cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0 mr-1.5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verification Status Card */}
        <div className="rounded-3xl border border-border/80 bg-white p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Trust & Verification</h3>
            <p className="text-xs text-foreground font-bold mt-0.5">Account Credentials status</p>
          </div>
          
          <div className="flex flex-col gap-2.5">
            {/* Step 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/40 bg-[#f8faf9]">
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${getVerificationStepStatus(1) === 'complete' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'}`}>
                  <User className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-semibold">
                  <p className="text-foreground">Contact Verification</p>
                  <p className="text-muted-foreground text-[8px]">Email & Phone check</p>
                </div>
              </div>
              {getVerificationStepStatus(1) === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : (
                <span className="text-[8px] bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-sm font-black uppercase">Pending</span>
              )}
            </div>

            {/* Step 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/40 bg-[#f8faf9]">
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${getVerificationStepStatus(2) === 'complete' ? 'bg-emerald-500/15 text-emerald-600' : getVerificationStepStatus(2) === 'review' ? 'bg-amber-500/15 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  <Award className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-semibold">
                  <p className="text-foreground">Govt Photo ID Check</p>
                  <p className="text-muted-foreground text-[8px]">Official identity audit</p>
                </div>
              </div>
              {getVerificationStepStatus(2) === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : getVerificationStepStatus(2) === 'review' ? (
                <span className="text-[8px] bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-sm font-black uppercase">Reviewing</span>
              ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/45 shrink-0" />
              )}
            </div>

            {/* Step 3 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl border border-border/40 bg-[#f8faf9]">
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${getVerificationStepStatus(3) === 'complete' ? 'bg-emerald-500/15 text-emerald-600' : getVerificationStepStatus(3) === 'review' ? 'bg-amber-500/15 text-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="text-[10px] font-semibold">
                  <p className="text-foreground">Driving Permit Lock</p>
                  <p className="text-muted-foreground text-[8px]">Vehicle rentals authorization</p>
                </div>
              </div>
              {getVerificationStepStatus(3) === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              ) : getVerificationStepStatus(3) === 'review' ? (
                <span className="text-[8px] bg-amber-500/15 text-amber-600 px-1.5 py-0.5 rounded-sm font-black uppercase">Reviewing</span>
              ) : (
                <Lock className="h-3.5 w-3.5 text-muted-foreground/45 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Statistics highlights */}
        <div className="rounded-3xl border border-border/80 bg-white p-5 shadow-xs flex flex-col gap-4 md:col-span-2">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Marketplace Analytics</h3>
            <p className="text-xs text-foreground font-bold mt-0.5">Platform performance stats</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-[#f8faf9] border border-border/40 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-primary text-xs font-black mb-1.5">
                <ShoppingBag className="h-4 w-4" />
                <span>My Listings</span>
              </div>
              <p className="text-2xl font-black text-foreground">{myListings.length}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">Active in catalogue</p>
            </div>

            <div className="bg-[#f8faf9] border border-border/40 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-primary text-xs font-black mb-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Trust Level</span>
              </div>
              <p className="text-[11px] font-black text-foreground uppercase mt-1">
                {user.verificationLevel === 'none' ? 'UNVERIFIED' : user.verificationLevel}
              </p>
              <p className="text-[9px] text-muted-foreground mt-2 font-bold">Audited trust tier</p>
            </div>

            <div className="bg-[#f8faf9] border border-border/40 p-4 rounded-2xl">
              <div className="flex items-center gap-1.5 text-primary text-xs font-black mb-1.5">
                <Star className="h-4 w-4" />
                <span>Renter Score</span>
              </div>
              <p className="text-2xl font-black text-foreground">{averageRating.toFixed(1)} ★</p>
              <p className="text-[9px] text-muted-foreground mt-0.5 font-bold">Based on {ratingCount} ratings</p>
            </div>

          </div>
        </div>
      </div>

      {/* Inventory Listings Grid Section */}
      <div className="rounded-3xl border border-border/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/40 pb-4 mb-4 gap-3">
          <div>
            <h3 className="text-base font-black text-foreground">My Inventory Catalogue</h3>
            <p className="text-xs text-muted-foreground mt-1">Manage public items, update daily pricing, or remove entries.</p>
          </div>
          <Link
            href="/create-listing"
            className="px-4 py-2.5 bg-primary text-white text-xs font-black rounded-xl transition hover:brightness-110 active:scale-95 shadow-md shadow-primary/10 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add New Item
          </Link>
        </div>

        {listingsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
            <p className="text-xs font-bold text-muted-foreground">Syncing inventory details...</p>
          </div>
        ) : myListings.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center text-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-[#f6faf8] flex items-center justify-center text-primary/60 border border-primary/10">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h4 className="font-extrabold text-sm text-foreground">No Listings Posted Yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              Earn daily passive revenue by renting out your cameras, drones, tools, sports gear, or electronics to peers in your community.
            </p>
            <Link
              href="/create-listing"
              className="mt-2 px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:brightness-110 transition active:scale-95 shadow-md shadow-primary/10"
            >
              List Your First Item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {myListings.map((l) => (
              <div 
                key={l._id} 
                className="group relative rounded-2xl border border-border/80 bg-white p-3.5 flex flex-col gap-3 hover:border-primary/25 hover:shadow-md transition-all duration-300"
              >
                {/* Images */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border/10 shrink-0">
                  <img
                    src={l.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&h=250&q=80'}
                    alt={l.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded-lg text-[9px] font-black text-white">
                    {formatCurrency(l.pricePerDay)}/day
                  </div>
                </div>

                {/* Details */}
                <div className="flex-grow flex flex-col justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-black text-foreground group-hover:text-primary truncate transition-colors duration-200">
                      {l.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 font-semibold leading-relaxed">
                      {l.description}
                    </p>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 border-t border-border/40 pt-3 text-[10px] font-bold text-foreground">
                    <Link
                      href={`/listing/${l._id}`}
                      className="flex-grow flex items-center justify-center gap-1 py-2 bg-white hover:bg-[#f8faf9] border border-border/80 rounded-xl text-[10px] font-black active:scale-95 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      View
                    </Link>
                    <Link
                      href={`/edit-listing/${l._id}`}
                      className="flex-grow flex items-center justify-center gap-1 py-2 bg-white hover:bg-[#f8faf9] border border-border/80 rounded-xl text-[10px] font-black active:scale-95 transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-primary" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteListing(l._id)}
                      className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl cursor-pointer active:scale-95 transition-all"
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
