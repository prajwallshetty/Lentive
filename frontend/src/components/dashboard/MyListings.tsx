'use client';

import React, { useEffect } from 'react';
import { useListingStore } from '../../store/listingStore';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../lib/utils';
import { Package, Pencil, Trash2 } from 'lucide-react';

interface MyListingsProps {
  onEditListing: (id: string) => void;
  onAddListing: () => void;
}

export default function MyListings({ onEditListing, onAddListing }: MyListingsProps) {
  const { showToast } = useToast();
  const { myListings, fetchMyListings, deleteListing } = useListingStore();

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await deleteListing(id);
      showToast('Listing deleted successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete listing.', 'error');
    }
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
        <h3 className="text-base font-extrabold text-foreground">My Listed Items</h3>
        <span className="text-xs text-muted-foreground font-semibold">Total: {myListings.length} items</span>
      </div>

      {myListings.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 mb-1 animate-pulse">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <h4 className="font-extrabold text-sm text-foreground">No Items Listed Yet</h4>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Turn your idle gear into extra income by listing them in your community.
          </p>
          <button
            onClick={onAddListing}
            className="mt-2 px-4 py-2 bg-primary hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            List Your First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {myListings.map((item) => (
            <div key={item._id} className="rounded-xl border border-border/30 p-3.5 bg-muted/20 hover:border-primary/35 hover:bg-muted/40 flex flex-col justify-between gap-3.5 transition-all duration-300 group shadow-sm">
              <div className="flex gap-3">
                <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-border/20 shrink-0 bg-muted">
                  <img 
                    src={item.images?.[0] || 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=80&h=80&q=80'} 
                    alt="" 
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors duration-200">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.category}</p>
                  </div>
                  <p className="text-sm font-extrabold text-primary mt-1">
                    {formatCurrency(item.pricePerDay)}<span className="text-[10px] text-muted-foreground font-bold">/day</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between border-t border-border/20 pt-2.5 mt-1 text-[10px] font-bold">
                <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase border ${
                  item.isAvailable 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15' 
                    : 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                }`}>
                  {item.isAvailable ? 'Listed Available' : 'Inactive / Booked'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditListing(item._id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <Pencil className="h-3 w-3 text-primary" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteListing(item._id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:border-rose-500/30 border border-rose-500/15 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
