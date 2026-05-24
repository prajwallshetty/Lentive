'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import DashboardView from '../../components/DashboardView';
import { useListingStore } from '../../store/listingStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { MOCK_LOCATIONS } from '../../lib/constants';
import { Loader2 } from 'lucide-react';

function DashboardContent() {
  const { user, loading: authLoading } = useAuth();
  const { filters } = useListingStore();
  const { activeTab } = useDashboardStore();
  const router = useRouter();

  // Route protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/dashboard');
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

  // Find active location object in constants based on current store coordinates
  const currentLocation = MOCK_LOCATIONS.find(
    (loc) => loc.coordinates[0] === filters.coordinates[0] && loc.coordinates[1] === filters.coordinates[1]
  ) || MOCK_LOCATIONS[0];

  return (
    <div className="w-full mt-16 pb-12">
      <DashboardView 
        user={user}
        currentLocation={currentLocation}
        initialTab={activeTab as any}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-semibold text-muted-foreground">Loading dashboard...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
