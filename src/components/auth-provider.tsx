'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

const publicRoutes = ['/login', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Don't do anything while loading

    const isPublicRoute = publicRoutes.includes(pathname);

    // If the user is logged in and tries to access a public route (login/signup), redirect to home.
    if (user && isPublicRoute) {
      router.push('/');
    } 
    // If the user is NOT logged in and is trying to access a private route, redirect to login.
    else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // While checking user status, show a loading indicator to prevent flashes of content.
  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }
  
  // If we are on a public route, or if the user is authenticated, show the children.
  if (publicRoutes.includes(pathname) || user) {
    return <>{children}</>;
  }

  // If not authenticated and on a private route, the useEffect has already started the redirect.
  // Return null to avoid rendering the private route content.
  return null;
}
