'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppSidebar } from './sidebar';
import { SidebarProvider } from './ui/sidebar';
import { Header } from './header';
import { MobileHeader } from './mobile-header';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const userProfileQuery = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileQuery);

  useEffect(() => {
    // If not loading and no user, go to login (if not already there)
    if (!isUserLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
    // If user is logged in and on login page, go to home
    if (!isUserLoading && user && pathname === '/login') {
      router.replace('/');
    }
    // If user profile is loaded and has no phone, go to complete profile page
    if (
      user &&
      userProfile &&
      !userProfile.phone &&
      pathname !== '/complete-profile'
    ) {
      router.replace('/complete-profile');
    }
  }, [user, isUserLoading, router, pathname, userProfile]);

  const isLoading = isUserLoading || (user && isProfileLoading);

  // If we are loading any of the critical data, show a spinner.
  // Also show spinner if we're on a protected route without a user (before redirect kicks in).
  if (
    isLoading ||
    (!user && !['/login', '/complete-profile'].includes(pathname))
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is on a public/special page, render it without layout
  if (pathname === '/login' || pathname === '/complete-profile') {
    return <>{children}</>;
  }

  // At this point, we have a user with a complete profile. Render the full app layout.
  if (user && userProfile?.phone) {
    if (isMobile) {
      return (
        <div className="relative flex min-h-screen w-full flex-col bg-background">
          <MobileHeader />
          <main className="flex-1 p-4 pb-28">{children}</main>
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

  // Fallback for any weird edge cases
  return null;
}
