'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ListingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/search');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-xs font-bold text-muted-foreground">Redirecting to Search...</p>
    </div>
  );
}
