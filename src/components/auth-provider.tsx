'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '@/firebase/client';
import { Skeleton } from './ui/skeleton';
import { Logo } from './icons';
import Link from 'next/link';

const AuthContext = createContext<{ user: User | null }>({ user: null });

const publicRoutes = ['/login', '/signup'];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary animate-pulse" />
                <h1 className="font-headline text-2xl font-semibold tracking-tight">Lexora</h1>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (isUserLoading) return;

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (user && isPublicRoute) {
      router.push('/');
    } else if (!user && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);
  
  // Show loading screen while we determine auth state
  if (isUserLoading) {
    return <LoadingScreen />;
  }

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, render it.
  // If it's a private route and the user exists, render it.
  if (isPublicRoute || user) {
    return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
  }
  
  // Otherwise, the effect hook will redirect, so we show a loading screen.
  return <LoadingScreen />;
}

export const useAuth = () => useContext(AuthContext);
