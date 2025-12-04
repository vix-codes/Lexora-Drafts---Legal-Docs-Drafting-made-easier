'use client';

import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useMemo } from 'react';
import { doc, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useDoc } from '@/firebase/firestore/use-doc';

const FIND_LAWYER_URL = '/find-lawyer';
const PROFILE_URL = '/profile';

function LawyerProfileLinkCard() {
  const { user } = useAuth();

  const lawyerDocRef = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return doc(db, 'lawyers', user.uid);
  }, [user]);

  const { data: lawyerData, isLoading } = useDoc(lawyerDocRef);

  if (isLoading || !lawyerData) {
    return null; // Don't show the card if user is not a lawyer or still loading
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Lawyer Profile
        </CardTitle>
        <CardDescription>Manage your professional details and client visibility.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={PROFILE_URL}>
            <Briefcase className="mr-2 h-4 w-4" />
            Update Profile
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
