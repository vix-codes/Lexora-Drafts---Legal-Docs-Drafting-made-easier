
'use client';

import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from '@/firebase/client';
import { BookText, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './icons';
import { Glossary } from './glossary';
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

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 text-foreground backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-xl font-semibold tracking-tight">lexintel</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        {user ? (
            <>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                    </Link>
                </Button>
                <Glossary>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted hover:text-foreground">
                    <BookText className="h-5 w-5" />
                    <span className="sr-only">Open Glossary</span>
                </Button>
                </Glossary>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-foreground hover:bg-muted hover:text-foreground">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Sign Out</span>
                </Button>
            </>
        ) : (
            <>
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                </Button>
            </>
        )}
      </div>
    </header>
  );
}
