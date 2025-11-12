
'use client';

import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import Link from 'next/link';

const FIND_LAWYER_BASE_URL = 'https://intelgpt.vercel.app/find-lawyer';

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
            <Link href={FIND_LAWYER_BASE_URL}>
              <Search className="mr-2 h-4 w-4" />
              Search Lawyers
            </Link>
          </Button>
        </CardContent>
      </Card>
      {children}
    </main>
  );
}
