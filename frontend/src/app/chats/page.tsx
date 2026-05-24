'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Chats from '../../components/dashboard/Chats';
import { Loader2, ArrowLeft, Compass } from 'lucide-react';
import Link from 'next/link';

function ChatsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/chats');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Verifying access session...</span>
      </div>
    );
  }

  const chatRecipientId = searchParams.get('chatRecipientId');
  const listingId = searchParams.get('listingId');

  return (
    <div className="w-full mt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fadeInUp">
      
      {/* Background Orbs */}
      <div className="absolute right-[-10%] top-[-10%] h-[500px] w-[500px] bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute left-[-10%] bottom-[-10%] h-[500px] w-[500px] bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Back and Browse Navigation Links */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-primary transition group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:brightness-110 transition bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/15 hover:bg-primary/10"
        >
          <Compass className="h-4 w-4" />
          Browse Listings
        </Link>
      </div>

      {/* Chats Component */}
      <div className="relative rounded-[28px] shadow-lg border border-border/20 overflow-hidden">
        <Chats 
          chatRecipientId={chatRecipientId} 
          listingId={listingId}
          onClearChatRecipient={() => {
            router.replace('/chats');
          }}
        />
      </div>
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Loading chats page...</span>
      </div>
    }>
      <ChatsPageContent />
    </Suspense>
  );
}
