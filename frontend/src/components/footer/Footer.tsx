'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Info, PhoneCall, HelpCircle, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-white dark:bg-[#070c0a] mt-auto py-12 pb-28 md:pb-12 relative z-10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-border/20 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 flex flex-col items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-primary to-[#10b981] flex items-center justify-center text-white text-base font-black shadow-sm shadow-primary/25">
                L
              </div>
              <span className="font-sans text-lg font-black text-foreground tracking-tight">Lentive</span>
            </Link>
            <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold max-w-xs">
              Empowering local communities to share resources. Rent tools, electronics, or gear directly from verified neighbors.
            </p>
            {/* Secure Payments Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40 text-[9px] text-muted-foreground font-bold mt-2">
              <Lock className="h-3 w-3 text-primary" />
              <span>Razorpay Secure Escrow</span>
            </div>
          </div>

          {/* Column 1: Marketplace */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Marketplace</h4>
            <div className="flex flex-col gap-2 text-xs font-bold text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Browse Rentals</Link>
              <Link href="/search" className="hover:text-primary transition-colors">Search Map</Link>
              <Link href="/create-listing" className="hover:text-primary transition-colors">Post an Item</Link>
              <Link href="/verification" className="hover:text-primary transition-colors">Verification center</Link>
            </div>
          </div>

          {/* Column 2: Safety & Trust */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Safety & Trust</h4>
            <div className="flex flex-col gap-2 text-xs font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>SafeRent™ Guarantee</span>
              </a>
              <a href="#" className="hover:text-primary transition-colors">Verification Rules</a>
              <a href="#" className="hover:text-primary transition-colors">Escrow Protection</a>
              <a href="#" className="hover:text-primary transition-colors">Community Guidelines</a>
            </div>
          </div>

          {/* Column 3: Contact & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Help & Support</h4>
            <div className="flex flex-col gap-2 text-xs font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>

        </div>

        {/* Lower Row Copyright Info */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[10px] text-muted-foreground font-semibold">
          <p>© 2026 Lentive Inc. Built for a cleaner, greener hyperlocal sharing economy.</p>
          <div className="flex items-center gap-1.5">
            <span>Made with</span>
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>in your neighborhood</span>
            <span>•</span>
            <span className="text-primary font-bold">SafeRent™ Certified</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
