'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=profile');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-xs font-bold text-muted-foreground">Redirecting to profile dashboard...</p>
    </div>
  );
}
