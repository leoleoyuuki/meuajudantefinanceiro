'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppSidebar } from './sidebar';
import { SidebarProvider } from './ui/sidebar';
import { Header } from './header';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
    if (isMobile) {
      return (
        <div className="relative flex min-h-screen w-full flex-col bg-secondary/50">
          <div className="container mx-auto max-w-lg flex-1 bg-background shadow-lg">
            <main className="pb-28">{children}</main>
          </div>
          <BottomNav />
        </div>
      );
    }

    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-secondary/50">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // if on /login page (and not logged in)
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return null;
}
