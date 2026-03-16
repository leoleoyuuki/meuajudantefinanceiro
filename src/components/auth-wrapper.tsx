'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { BottomNav } from './bottom-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppSidebar } from './sidebar';
import { SidebarProvider } from './ui/sidebar';
import { Header } from './header';
import { MobileHeader } from './mobile-header';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { isAfter } from 'date-fns';

const ADMIN_EMAIL = 'leo.yuuki@icloud.com';

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

  const isAdmin = user?.email === ADMIN_EMAIL;

  const subscriptionStatus = useMemo(() => {
    if (isAdmin) return 'active';
    if (!userProfile) return 'inactive';
    if (
      userProfile.subscriptionStatus === 'active' &&
      userProfile.subscriptionExpiresAt
    ) {
      return isAfter(new Date(), new Date(userProfile.subscriptionExpiresAt))
        ? 'expired'
        : 'active';
    }
    return userProfile.subscriptionStatus || 'inactive';
  }, [userProfile, isAdmin]);

  useEffect(() => {
    if (isUserLoading || (user && isProfileLoading)) {
      return; // Wait until all data is loaded
    }

    // If not loading and no user, go to login (if not already there or on special pages)
    if (!user && !['/login', '/activate'].includes(pathname)) {
      router.replace('/login');
      return;
    }

    // If user is logged in...
    if (user) {
      if (pathname === '/login') {
        router.replace('/');
        return;
      }

      // If user profile is loaded and has no whatsapp, go to complete profile page
      if (
        userProfile &&
        !userProfile.whatsapp &&
        pathname !== '/complete-profile'
      ) {
        router.replace('/complete-profile');
        return;
      }

      // If user has completed profile but subscription is not active, redirect to activate
      if (
        userProfile?.whatsapp &&
        subscriptionStatus !== 'active' &&
        pathname !== '/activate'
      ) {
        router.replace('/activate');
        return;
      }

      // If user has active subscription but is on activate page, redirect to home
      if (subscriptionStatus === 'active' && pathname === '/activate') {
        router.replace('/');
        return;
      }
    }
  }, [
    user,
    isUserLoading,
    isProfileLoading,
    userProfile,
    subscriptionStatus,
    router,
    pathname,
  ]);

  const isLoading = isUserLoading || (user && isProfileLoading);

  const unprotectedPaths = ['/login', '/complete-profile', '/activate'];

  // Show a global loader while we determine the user's auth/profile/subscription state
  if (isLoading && !unprotectedPaths.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If on a page that doesn't require the full layout, just render children
  if (unprotectedPaths.includes(pathname)) {
    if (
      pathname === '/activate' &&
      subscriptionStatus === 'active' &&
      !isLoading
    ) {
      // This is a flicker case where user lands on activate but should be home.
      // The useEffect will redirect, but we can show a loader to make it smoother.
      return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    return <>{children}</>;
  }

  // At this point, we have a user with a complete profile and active subscription. Render the full app layout.
  if (user && userProfile?.whatsapp && subscriptionStatus === 'active') {
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
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
