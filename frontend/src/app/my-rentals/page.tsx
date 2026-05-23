'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function MyRentalsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/bookings?tab=renting');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-7 w-7 text-primary animate-spin" />
      <p className="text-xs font-bold text-muted-foreground">Redirecting to rentals...</p>
    </div>
  );
}
