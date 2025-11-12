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
    if (isUserLoading) return;

    const isPublicRoute = publicRoutes.includes(pathname);

    if (user && isPublicRoute) {
      router.push('/');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        Loading...
      </div>
    );
  }
  
  if (!user && !publicRoutes.includes(pathname)) {
    return null; 
  }

  if(user && publicRoutes.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
