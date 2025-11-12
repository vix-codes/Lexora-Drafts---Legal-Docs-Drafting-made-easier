
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const PRECEDENTS_BASE_URL = 'https://intelgpt.vercel.app/precedents';

export default function LegalPrecedents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-primary" />
          Key Legal Precedents
        </CardTitle>
        <CardDescription>
          Explore landmark cases and their impact.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={PRECEDENTS_BASE_URL}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Explore Cases
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
