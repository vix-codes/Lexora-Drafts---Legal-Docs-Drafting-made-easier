
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { app } from '@/firebase/client';
import { Skeleton } from './ui/skeleton';
import { Logo } from './icons';
import { FirebaseErrorListener } from './FirebaseErrorListener';

const AuthContext = createContext<{ user: User | null; isUserLoading: boolean }>({ user: null, isUserLoading: true });

const authRequiredRoutes = ['/dashboard', '/lawyer-panel', '/my-requests'];
const lawyerOnlyRoutes = ['/lawyer-panel'];
const publicOnlyRoutes = ['/login', '/signup'];
const LAWYER_EMAIL = 'lawyer@lexintel.com';

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

    const isLawyer = user?.email === LAWYER_EMAIL;
    const pathIsAuthRequired = authRequiredRoutes.some(route => pathname.startsWith(route));
    const pathIsLawyerOnly = lawyerOnlyRoutes.some(route => pathname.startsWith(route));
    const pathIsPublicOnly = publicOnlyRoutes.some(route => pathname.startsWith(route));

    // Handle authenticated users
    if (user) {
      if (isLawyer) {
        // If lawyer is logged in and not on their panel, redirect them.
        if (pathname !== '/lawyer-panel') {
          router.push('/lawyer-panel');
        }
      } else { // Regular user
        // If a regular user tries to access a lawyer-only page, sign them out and redirect.
        if (pathIsLawyerOnly) {
          signOut(auth).then(() => {
            router.push('/');
          });
        }
        // If a regular user is on a public-only page (e.g. /login), redirect to homepage.
        else if (pathIsPublicOnly) {
            router.push('/');
        }
      }
    }
    // Handle unauthenticated users
    else {
      // If the user is not logged in and tries to access a protected route, redirect to login.
      if (pathIsAuthRequired) {
        if(pathIsLawyerOnly) {
            router.push('/login');
        } else {
            router.push('/login');
        }
      }
    }
  }, [user, isUserLoading, router, pathname, auth]);
  
  if (isUserLoading && authRequiredRoutes.some(route => pathname.startsWith(route))) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, isUserLoading }}>
      {children}
      <FirebaseErrorListener />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
