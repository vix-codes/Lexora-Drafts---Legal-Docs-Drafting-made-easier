'use client';

import { useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { useDoc, type WithId } from '@/firebase/firestore/use-doc';
import { getFirestore, doc } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import Link from 'next/link';

type Draft = {
  documentType: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  content: string;
};

export default function DraftDetailPage({ params }: { params: { draftId: string } }) {
  const { user } = useAuth();
  const db = getFirestore(app);

  const draftRef = useMemo(() => {
    if (!user || !params.draftId) return null;
    const ref = doc(db, 'users', user.uid, 'drafts', params.draftId);
    // This is a hack to get useDoc to memoize the ref
    (ref as any).__memo = true;
    return ref;
  }, [user, params.draftId, db]);

  const { data: draft, isLoading, error } = useDoc<Draft>(draftRef);
  
  const handleDownload = () => {
    if (!draft) return;
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${draft.documentType}</title>
        </head>
        <body>
          <pre style="font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word;">${draft.content}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.documentType.replace(/\s+/g, '_')}_Draft.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/history">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to History</span>
          </Link>
        </Button>
        <h1 className="font-headline text-3xl font-semibold">
          {draft ? draft.documentType : 'Draft'}
        </h1>
      </div>
      
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-headline flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Content
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Loading document...' : 'Review your saved document below.'}
            </CardDescription>
          </div>
          {draft && !isLoading && (
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <br />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : draft ? (
            <div className="rounded-md border bg-muted/50 p-4 h-full overflow-auto">
              <pre className="font-body text-sm text-foreground bg-transparent p-0 m-0 whitespace-pre-wrap">
                {draft.content}
              </pre>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">
                {error ? 'Could not load document.' : 'Document not found.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
