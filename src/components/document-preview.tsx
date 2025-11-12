
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Download, FileText, Loader2, X } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

interface DocumentPreviewProps {
  draft: string | undefined;
  isLoading: boolean;
  documentTypeLabel: string;
  onClose: () => void;
}

export function DocumentPreview({ draft, isLoading, documentTypeLabel, onClose }: DocumentPreviewProps) {
  const handleDownload = () => {
    if (!draft) return;
    
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${documentTypeLabel}</title>
        </head>
        <body>
          <pre style="font-family: sans-serif; white-space: pre-wrap; word-wrap: break-word;">${draft}</pre>
        </body>
      </html>
    `;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTypeLabel.replace(/\s+/g, '_')}_Draft.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="font-headline flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generated Draft
          </CardTitle>
          <CardDescription>Review the generated document below.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {draft && !isLoading && (
            <Button onClick={handleDownload} size="sm" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
          <Button onClick={onClose} size="icon" variant="ghost">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
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
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : draft ? (
          <div className="rounded-md border bg-background p-4 h-full overflow-auto">
            <pre className="font-body text-sm text-foreground bg-transparent p-0 m-0 whitespace-pre-wrap">
              {draft}
            </pre>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Your document will appear here...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
