'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MyListingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?tab=listings');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-7 w-7 text-primary animate-spin" />
      <p className="text-xs font-bold text-muted-foreground">Redirecting to listings dashboard...</p>
    </div>
  );
}
