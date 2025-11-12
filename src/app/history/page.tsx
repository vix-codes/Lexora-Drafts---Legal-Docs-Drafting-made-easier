'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { getFirestore, collection, query, orderBy, where } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { History, FileText, ArrowRight, PlusCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type Draft = {
  documentType: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  } | null;
  content: string;
};

function DraftCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5 mt-2" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-32" />
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
    return (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No Drafts Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">You haven&apos;t created any legal drafts.</p>
            <div className="mt-6">
                <Button asChild>
                    <Link href="/draft">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Draft
                    </Link>
                </Button>
            </div>
        </div>
    );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const db = getFirestore(app);

  const draftsQuery = useMemo(() => {
    if (!user) return null;
    const coll = collection(db, 'users', user.uid, 'drafts');
    const q = query(coll, orderBy('createdAt', 'desc'));
    // This is a hack to get useCollection to memoize the query
    (q as any).__memo = true;
    return q;
  }, [user, db]);

  const { data: drafts, isLoading, error } = useCollection<Draft>(draftsQuery);
  
  const formatTimestamp = (timestamp: Draft['createdAt']) => {
    if (!timestamp) return 'Date unknown';
    const date = new Date(timestamp.seconds * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold flex items-center gap-3">
          <History className="h-7 w-7 text-primary" />
          Draft History
        </h1>
      </div>
      <p className="text-muted-foreground">
        Here are the legal documents you have previously generated and saved.
      </p>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DraftCardSkeleton />
          <DraftCardSkeleton />
          <DraftCardSkeleton />
        </div>
      )}

      {!isLoading && !error && drafts && drafts.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map((draft: WithId<Draft>) => (
            <Card key={draft.id}>
              <CardHeader>
                <CardTitle className="font-headline">{draft.documentType}</CardTitle>
                <CardDescription>{formatTimestamp(draft.createdAt)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {draft.content.substring(0, 150)}...
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={`/history/${draft.id}`}>
                    View Full Draft <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && drafts?.length === 0 && <EmptyState />}

      {error && (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription className="text-destructive/80">
                    There was a problem loading your drafts. Please try again later.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}
