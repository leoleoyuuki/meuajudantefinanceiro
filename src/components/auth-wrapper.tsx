'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './bottom-nav';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
    if (!isUserLoading && user && pathname === '/login') {
      router.replace('/');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading || (!user && pathname !== '/login')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user && pathname !== '/login') {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-secondary/50">
        <div className="container mx-auto max-w-lg flex-1 bg-background shadow-lg">
          <main className="pb-28">{children}</main>
        </div>
        <BottomNav />
      </div>
    );
  }

  // if on /login page (and not logged in)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return null;
}
