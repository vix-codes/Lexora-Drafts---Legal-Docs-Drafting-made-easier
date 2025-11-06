import { displayLawUpdatesWithSummaries } from '@/ai/flows/display-law-updates-with-summaries';
import { lawUpdates as mockUpdates } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Scale } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function LawFeed() {
  const updatesWithSummaries = await displayLawUpdatesWithSummaries(mockUpdates.slice(0, 10));

  return (
    <Card className="hidden md:flex md:flex-col max-h-[calc(100vh-5rem)]">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Law & Case Updates
        </CardTitle>
        <CardDescription>Latest legal news and rulings from India.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 pt-0 space-y-6">
            {updatesWithSummaries.map((update, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{formatDistanceToNow(new Date(update.timestamp * 1000), { addSuffix: true })}</Badge>
                  <Link href={update.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                    Read More
                  </Link>
                </div>
                <h3 className="font-semibold tracking-tight">{update.title}</h3>
                <p className="text-sm text-muted-foreground">{update.aiSummary}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
