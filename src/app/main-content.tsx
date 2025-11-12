
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, ArrowRight } from 'lucide-react';

const DRAFT_URL = '/draft';

export default function MainContent() {

  const openDraftPage = () => {
    window.open(DRAFT_URL, '_blank', 'noopener,noreferrer');
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Lexora Drafts
          </CardTitle>
          <CardDescription>Select a document type and fill in the details to generate your draft.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openDraftPage} className="w-full">
            Start Drafting
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
  );
}
