'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';

const PRECEDENTS_BASE_URL = 'https://intelgpt.vercel.app/precedents';
const PRECEDENTS_URL_WITH_THEME = `${PRECEDENTS_BASE_URL}?embed=true&theme=dark&backgroundColor=hsl(241_30%_19%)&textColor=hsl(0_0%_98%)&primaryColor=hsl(242_100%_70%)&hideTitle=true&hideHeader=true`;

export default function LegalPrecedents() {
  const openPrecedents = () => {
    window.open(PRECEDENTS_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-primary" />
          Key Legal Precedents
        </CardTitle>
        <CardDescription>
          Explore landmark cases and their impact. Click to open in a new tab.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 cursor-pointer" onClick={openPrecedents}>
        <iframe
          src={PRECEDENTS_URL_WITH_THEME}
          className="w-full h-full min-h-[400px] border-0 rounded-b-lg pointer-events-none"
          title="Key Legal Precedents"
        />
      </CardContent>
    </Card>
  );
}
