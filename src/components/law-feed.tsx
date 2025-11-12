import { displayLawUpdatesWithSummaries } from '@/ai/flows/display-law-updates-with-summaries';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

export default async function LawFeed() {
  const updates = await displayLawUpdatesWithSummaries();

  if (!updates || updates.length === 0) {
    return <p className="text-muted-foreground">No recent updates available.</p>;
  }

  return (
    <div className="space-y-6">
      {updates.slice(0, 3).map((update, index) => (
        <div key={index} className="space-y-1">
          <h3 className="font-semibold text-primary">{update.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{update.summary}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground/80 pt-1">
            <span>{formatDistanceToNow(new Date(update.timestamp * 1000), { addSuffix: true })}</span>
            <a
              href={update.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-primary transition-colors"
            >
              Read More <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
