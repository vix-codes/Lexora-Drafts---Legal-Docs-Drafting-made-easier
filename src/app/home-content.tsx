'use client';

import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useMemo } from 'react';

const FIND_LAWYER_URL = '/find-lawyer';

function LawyerProfileLinkCard() {
  const { user } = useAuth();

  const lawyerDocRef = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return doc(db, 'lawyers', user.uid);
  }, [user]);

  const { data: lawyerData } = useDoc(lawyerDocRef);

  if (!lawyerData) {
    return null; // Don't render if the user is not a lawyer
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Lawyer Dashboard
        </CardTitle>
        <CardDescription>Manage your professional profile and client interactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/profile">
            Go to Your Dashboard
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}


export default function HomeContent({ children }: { children: ReactNode }) {
  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
      <MainContent />
      <Lawbot />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find a Lawyer
          </CardTitle>
          <CardDescription>Search for legal professionals in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={FIND_LAWYER_URL}>
              <Search className="mr-2 h-4 w-4" />
              Search Lawyers
            </Link>
          </Button>
        </CardContent>
      </Card>
      <LawyerProfileLinkCard />
      {children}
    </main>
  );
}
