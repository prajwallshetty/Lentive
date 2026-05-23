'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border/20 bg-white/40 dark:bg-[#080c0a]/40 backdrop-blur-md mt-auto py-12 pb-28 md:pb-12 relative z-10 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Upper Column Footer Layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border/10 pb-8 mb-8">
          
          {/* Brand & Mission Statement */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2.5">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-[#059669] flex items-center justify-center text-white text-xs font-black shadow-xs">
                L
              </div>
              <span className="font-display text-lg font-black text-primary tracking-tight">lentive</span>
            </Link>
            <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed font-semibold">
              Empowering communities to share resources hyperlocal, reducing waste, and building local trust.
            </p>
          </div>

          {/* Social Links and Guidelines */}
          <div className="flex flex-col items-center md:items-end gap-3.5">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Safety Guide</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
            </div>
            
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-8 w-8 rounded-full border border-border/30 bg-muted/25 hover:bg-primary hover:border-primary/20 hover:text-white text-muted-foreground flex items-center justify-center transition-all duration-300 active:scale-90"
                  title={social}
                >
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    {social === 'facebook' ? 'share' : social === 'twitter' ? 'chat' : social === 'instagram' ? 'photo_camera' : 'group'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row Copyright Info */}
        <div className="text-center text-[10px] text-muted-foreground/80 font-semibold flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Lentive. Hyperlocal Sharing Economy Marketplace Platform.</p>
          <p className="flex items-center gap-1.5 justify-center">
            <span>Built with Next.js, Express, MongoDB and Tailwind CSS</span>
            <span>•</span>
            <span className="text-primary font-bold">SafeRent™ Certified</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
