
'use client';

import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '@/firebase/client';
import { LogOut } from 'lucide-react';
import { Logo } from './icons';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import Link from 'next/link';

export default function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    const auth = getAuth(app);
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };
  
  const getUsername = () => {
      if (!user) return '';
      if (user.displayName) return user.displayName;
      return user.email?.split('@')[0] || 'User';
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 text-foreground backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-semibold tracking-tight">lexintel</h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
            <>
                <span className="text-sm text-muted-foreground">Hi, {getUsername()}</span>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-foreground hover:bg-muted hover:text-foreground">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sign Out</span>
                </Button>
            </>
        ) : (
           null
        )}
      </div>
    </header>
  );
}
