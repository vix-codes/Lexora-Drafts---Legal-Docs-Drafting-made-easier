
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookMarked, ExternalLink } from 'lucide-react';

const PRECEDENTS_BASE_URL = 'https://intelgpt.vercel.app/precedents';

export default function LegalPrecedents() {
  const openPrecedents = () => {
    window.open(PRECEDENTS_BASE_URL, '_blank', 'noopener,noreferrer');
  };

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
        <Button onClick={openPrecedents} className="w-full">
          <ExternalLink className="mr-2 h-4 w-4" />
          Explore Cases
        </Button>
      </CardContent>
    </Card>
  );
}
