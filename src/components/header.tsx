'use client';

import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '@/firebase/client';
import { BookText, LogOut } from 'lucide-react';
import { Logo } from './icons';
import { Glossary } from './glossary';
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import Link from 'next/link';

function getUsername(email: string | null | undefined): string {
    if (!email) return 'Guest';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
}

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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-primary px-4 text-primary-foreground backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-7 w-7 text-white" />
          <h1 className="font-headline text-xl font-semibold tracking-tight">lexintel</h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user && <span className="text-sm font-medium text-white/80">Hi, {getUsername(user.email)}</span>}
        <div className="flex items-center gap-2">
            <Glossary>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
                  <BookText className="h-5 w-5" />
                  <span className="sr-only">Open Glossary</span>
              </Button>
            </Glossary>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-white hover:bg-white/10 hover:text-white">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
            </Button>
        </div>
      </div>
    </header>
  );
}
