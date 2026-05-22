'use client';

import React, { useState, useEffect } from 'react';
import { useListingStore } from '../../store/listingStore';
import { useToast } from '../../context/ToastContext';
import { MockLocation } from '../../lib/constants';
import { PlusCircle, AlertCircle, Upload, X, CheckCircle2 } from 'lucide-react';

interface ListingFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingListingId?: string | null;
  currentLocation: MockLocation;
}

export default function ListingForm({ isOpen, onClose, editingListingId, currentLocation }: ListingFormProps) {
  const { showToast } = useToast();
  const { myListings, createListing, updateListing } = useListingStore();
  
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Tools');
  const [formPrice, setFormPrice] = useState(15);
  const [formDeposit, setFormDeposit] = useState(50);
  const [formAddress, setFormAddress] = useState(currentLocation.address);
  const [formImage, setFormImage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingListingId) {
        const item = myListings.find(l => l._id === editingListingId);
        if (item) {
          setFormTitle(item.title || '');
          setFormDescription(item.description || '');
          setFormCategory(item.category || 'Tools');
          setFormPrice(item.pricePerDay || 0);
          setFormDeposit(item.securityDeposit || 0);
          setFormAddress(item.address || currentLocation.address);
          setFormImage(item.images?.[0] || '');
        }
      } else {
        // Reset form for creation
        setFormTitle('');
        setFormDescription('');
        setFormCategory('Tools');
        setFormPrice(15);
        setFormDeposit(50);
        setFormAddress(currentLocation.address);
        setFormImage('');
      }
      setFormError('');
      setFormSuccess(false);
    }
  }, [isOpen, editingListingId, currentLocation, myListings]);

  if (!isOpen) return null;

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

      const existingCoordinates = myListings.find(l => l._id === editingListingId)?.location?.coordinates;

      const payload = {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        pricePerDay: Number(formPrice),
        securityDeposit: Number(formDeposit),
        images: defaultImages,
        address: formAddress,
        coordinates: existingCoordinates || currentLocation.coordinates
      };

      if (editingListingId) {
        await updateListing(editingListingId, payload);
        showToast('Listing updated successfully!', 'success');
      } else {
        await createListing(payload);
        showToast('Listing created successfully!', 'success');
      }

      setFormSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save listing.');
      showToast(err.message || 'Failed to save listing.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/70 backdrop-blur-xs bottom-sheet-overlay">
      <div className="relative w-full md:max-w-lg max-h-[92vh] md:max-h-[95vh] overflow-y-auto rounded-t-[28px] md:rounded-2xl bg-card border-t md:border border-border/40 p-6 shadow-2xl bottom-sheet-content md:animate-in md:zoom-in-95 md:duration-200 hide-scrollbar">
        
        {/* Mobile drag handle */}
        <div className="block md:hidden drag-handle" />

        <h3 className="text-xl font-extrabold text-foreground tracking-tight border-b border-border/40 pb-3 mt-2 md:mt-0">
          {editingListingId ? 'Edit Listed Item' : 'List a New Item'}
        </h3>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {formSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="font-bold text-lg text-foreground">{editingListingId ? 'Item Updated!' : 'Item Listed!'}</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
              {editingListingId ? 'Your item changes have been saved.' : 'Item was listed successfully at your simulated location!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 text-xs font-semibold text-foreground">
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Item Title</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Cordless Lawn Mower"
                className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="rounded-xl border border-border bg-card p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs"
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

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Address / Location</label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Price / Day (₹)</label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Security Deposit (₹)</label>
                <input
                  type="number"
                  value={formDeposit}
                  onChange={(e) => setFormDeposit(Number(e.target.value))}
                  className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
              <textarea
                required
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Provide condition, features, and pickup instructions..."
                rows={3}
                className="rounded-xl border border-border bg-muted/40 p-2.5 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-1">
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
                  className="flex flex-col items-center justify-center border border-dashed border-border/60 hover:border-primary/60 rounded-xl p-4.5 cursor-pointer transition-all duration-200 bg-muted/20 hover:bg-muted/40"
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
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                This item will be listed at coordinates <span className="font-semibold text-foreground">[{currentLocation.coordinates.join(', ')}]</span> corresponding to your current simulated location, enabling hyperlocal discovery.
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
              className="w-full py-2.5 bg-primary text-white font-extrabold rounded-xl hover:brightness-110 border border-primary/20 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 mt-2"
            >
              {editingListingId ? 'Save Changes' : 'Confirm Listing'}
            </button>

          </form>
        )}
      </div>
    </div>
  );
}
