'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '../navbar/Navbar';
import MobileNav from '../navbar/MobileNav';
import Footer from '../footer/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pages that do NOT show the standard layout (navbar, footer, bottom nav)
  const isAuthPage = 
    pathname === '/login' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password' || 
    pathname === '/verify-email';

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (pathname === '/map') {
    return (
      <div className="h-screen w-screen flex flex-col bg-background text-foreground transition-all duration-300 relative overflow-hidden">
        <Navbar />
        <main className="flex-grow w-full h-full relative z-10">
          {children}
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-all duration-300 relative overflow-hidden">
      {/* Top sticky/floating navbar */}
      <Navbar />

      {/* Main content body with bottom margin padding to prevent mobile navbar overlap */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-12 flex flex-col gap-6 relative z-10 animate-fadeInUp">
        {children}
      </main>

      {/* Floating mobile bottom navigation capsule */}
      <MobileNav />

      {/* Desktop footer (adapted/stacked on mobile) */}
      <Footer />
    </div>
  );
}
