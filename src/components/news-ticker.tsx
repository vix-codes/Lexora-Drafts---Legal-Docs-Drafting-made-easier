
'use server';

import { displayLawUpdatesWithSummaries, type LawUpdate } from '@/ai/flows/display-law-updates-with-summaries';
import { Newspaper } from 'lucide-react';
import Link from 'next/link';
import '../app/animations.css';

export default async function NewsTicker() {
  const updates: LawUpdate[] = await displayLawUpdatesWithSummaries();

  if (!updates || updates.length === 0) {
    return null;
  }

  const tickerContent = updates.map((update, index) => (
    <Link
      key={index}
      href={update.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm mx-4 text-muted-foreground hover:text-primary transition-colors"
    >
      {update.title}
    </Link>
  ));

  return (
    <div className="relative flex overflow-x-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="py-3 px-4 flex items-center bg-muted/50 border-r">
        <Newspaper className="h-5 w-5 text-primary" />
        <span className="ml-3 font-semibold text-sm whitespace-nowrap">Latest Updates</span>
      </div>
      <div className="py-3 flex-1 whitespace-nowrap flex animate-marquee">
        {tickerContent}
        {tickerContent}
      </div>
    </div>
  );
}
