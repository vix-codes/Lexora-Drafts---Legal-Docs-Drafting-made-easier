
'use client';

import Link from 'next/link';
import { Logo } from './icons';

export default function Footer() {
  return (
    <footer className="border-t bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-7 w-7 text-primary" />
              <h1 className="font-headline text-xl font-semibold tracking-tight">lexintel</h1>
            </Link>
            <p className="text-sm text-muted-foreground">Legal Intelligence, Simplified.</p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} lexintel. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
