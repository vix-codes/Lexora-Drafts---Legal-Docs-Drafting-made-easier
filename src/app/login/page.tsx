
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { displayLawUpdatesWithSummaries } from '@/ai/flows/display-law-updates-with-summaries';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import LoginForm from './login-form';
import type { LawUpdate } from '@/ai/flows/display-law-updates-with-summaries';

function LawFeedLoading() {
    return (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            ))}
        </div>
    )
}

async function LawFeed() {
  const updates: LawUpdate[] = await displayLawUpdatesWithSummaries();

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

export default function LoginPage() {
  return (
    <LoginForm>
        <Suspense fallback={<LawFeedLoading />}>
            {/* @ts-expect-error Server Component */}
            <LawFeed />
        </Suspense>
    </LoginForm>
  );
}
