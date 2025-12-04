
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { app } from '@/firebase/client';
import { Skeleton } from './ui/skeleton';
import { Logo } from './icons';

const AuthContext = createContext<{ user: User | null }>({ user: null });

const authRequiredRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/signup', '/lawyer-signup', '/draft', '/lawbot', '/find-lawyer', '/'];

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary animate-pulse" />
                <h1 className="font-headline text-2xl font-semibold tracking-tight">lexintel</h1>
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

    const pathIsPublic = publicRoutes.some(route => pathname === route || (route !== '/' && pathname.startsWith(route)));
    const pathIsAuthRequired = authRequiredRoutes.some(route => pathname.startsWith(route));
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

    if (user && isAuthPage) {
      router.push('/dashboard');
    } else if (!user && pathIsAuthRequired) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);
  
  // Show loading screen while we determine auth state for required auth pages
  if (isUserLoading && authRequiredRoutes.some(route => pathname.startsWith(route))) {
    return <LoadingScreen />;
  }

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
