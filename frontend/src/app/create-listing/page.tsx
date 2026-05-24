'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useListingStore } from '../../store/listingStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { useToast } from '../../context/ToastContext';
import { MOCK_LOCATIONS } from '../../lib/constants';
import { PlusCircle, AlertCircle, Upload, X, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateListingPage() {
  const { user, loading: authLoading } = useAuth();
  const { filters, createListing } = useListingStore();
  const { showToast } = useToast();
  const router = useRouter();

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Tools');
  const [formPrice, setFormPrice] = useState(500);
  const [formDeposit, setFormDeposit] = useState(2000);
  const [formAddress, setFormAddress] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Get current location
  const currentLocation = MOCK_LOCATIONS.find(
    (loc) => loc.coordinates[0] === filters.coordinates[0] && loc.coordinates[1] === filters.coordinates[1]
  ) || MOCK_LOCATIONS[0];

  // Route protection & initialize address
  useEffect(() => {
    if (!authLoading && !user) {
      showToast('Please log in to post an item.', 'info');
      router.push('/login?redirect=/create-listing');
    } else if (user) {
      setFormAddress(currentLocation.address);
    }
  }, [user, authLoading, currentLocation, router]);

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Please select an image under 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formTitle || !formDescription || !formAddress) {
      setFormError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const defaultImages = formImage ? [formImage] : [
        formCategory === 'Tools' ? 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Electronics' ? 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Vehicles' ? 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Outdoor' ? 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Party Supplies' ? 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80' :
        formCategory === 'Fashion' ? 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' :
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80'
      ];

      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        pricePerDay: Number(formPrice),
        securityDeposit: Number(formDeposit),
        images: defaultImages,
        address: formAddress,
        coordinates: currentLocation.coordinates
      };

      await createListing(payload);
      setFormSuccess(true);
      showToast('Item listed successfully!', 'success');
      setTimeout(() => {
        useDashboardStore.getState().setActiveTab('listings');
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing.');
      showToast(err.message || 'Failed to save listing.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full px-2 py-4 mt-20">
      
      <Link 
        href="/"
        className="inline-flex items-center gap-2 mb-6 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Cancel and Back
      </Link>

      <div className="rounded-3xl border border-border/25 bg-card p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />
        
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">List a New Item</h2>
          <p className="text-xs text-muted-foreground mt-1">Provide clear pictures, descriptions, and pickup terms for your item.</p>
        </div>

        {formSuccess ? (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-lg text-foreground">Item Posted!</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              Your rental listing was published successfully. You can manage reservations inside your owner console.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-semibold text-foreground">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Item Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Bosch Cordless Power Drill"
                className="rounded-xl border border-border bg-muted/40 p-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="rounded-xl border border-border bg-card p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
                >
                  <option>Tools</option>
                  <option>Electronics</option>
                  <option>Vehicles</option>
                  <option>Outdoor</option>
                  <option>Party Supplies</option>
                  <option>Fashion</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Address / Location</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="rounded-xl border border-border bg-muted/40 p-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Price per Day (₹)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formDeposit}
                  onChange={(e) => setFormDeposit(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
              <textarea
                required
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Include information like: general condition, specific features, pickup availability, and accessories included..."
                rows={3}
                className="rounded-xl border border-border bg-muted/40 p-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Item Image</label>
              <div className="flex flex-col gap-2">
                {formImage && (
                  <div className="relative h-28 w-full rounded-xl overflow-hidden border border-border/40 bg-muted">
                    <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage('')}
                      className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white rounded-full p-1.5 hover:text-rose-400 transition cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleImageFile(file);
                  }}
                  className="flex flex-col items-center justify-center border border-dashed border-border/60 hover:border-primary/60 rounded-xl p-6 cursor-pointer transition-all duration-200 bg-muted/20 hover:bg-muted/40"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    className="hidden"
                    id="image-file-input"
                  />
                  <label htmlFor="image-file-input" className="cursor-pointer flex flex-col items-center text-center w-full">
                    <Upload className="h-5 w-5 text-primary mb-1.5" />
                    <span className="text-[11px] text-muted-foreground">
                      Drag & drop or <span className="text-primary font-bold hover:underline">browse</span> image file
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 mt-0.5">Supports PNG, JPG, GIF up to 5MB</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10">
              <PlusCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                This item will be cataloged at coordinates <span className="font-bold text-foreground">[{currentLocation.coordinates.join(', ')}]</span>. Only nearby users searching coordinates within your radius limit can browse it.
              </p>
            </div>

            {formError && (
              <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-[10px]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 mt-2 disabled:opacity-50"
            >
              {submitting ? 'Creating Listing...' : 'Publish Listing'}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
