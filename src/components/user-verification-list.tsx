
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, getFirestore } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from './auth-provider';

type VerificationRequest = {
  documentType: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: { seconds: number; nanoseconds: number };
  updatedAt: { seconds: number; nanoseconds: number };
  lawyerComments: { text: string; timestamp: { seconds: number; nanoseconds: number } }[];
  draftContent: string;
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
  reviewed: { label: 'Reviewed', icon: MessageSquare, color: 'bg-blue-500' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'bg-green-500' },
};

function VerificationRequestItem({ request }: { request: WithId<VerificationRequest> }) {
  const statusInfo = statusConfig[request.status];
  const Icon = statusInfo.icon;

  return (
    <AccordionItem value={request.id}>
      <AccordionTrigger>
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 text-white ${statusInfo.color} rounded-full p-0.5`} />
            <div className="text-left">
              <p className="font-semibold">{request.documentType}</p>
              <p className="text-sm text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Badge variant={request.status === 'approved' ? 'default' : 'secondary'}>{statusInfo.label}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-4">
        <h4 className="font-semibold">Original Draft:</h4>
        <div className="rounded-md border bg-muted p-4 max-h-48 overflow-auto">
            <pre className="font-body text-sm text-foreground bg-transparent p-0 m-0 whitespace-pre-wrap">
              {request.draftContent}
            </pre>
        </div>
        {request.lawyerComments && request.lawyerComments.length > 0 ? (
          <div>
            <h4 className="font-semibold mb-2">Lawyer's Comments:</h4>
            <div className="space-y-3">
              {request.lawyerComments.slice().reverse().map((comment, index) => (
                <div key={index} className="p-3 rounded-md bg-muted/50 border">
                  <p className="text-sm">{comment.text}</p>
                   {comment.timestamp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(comment.timestamp.seconds * 1000), { addSuffix: true })}
                    </p>
                   )}
                </div>
              ))}
            </div>
          </div>
        ) : (
            <div>
                 <h4 className="font-semibold mb-2">Lawyer's Comments:</h4>
                 <p className="text-sm text-muted-foreground">No comments yet. Your request is being reviewed.</p>
            </div>
         )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function UserVerificationList({ userId }: { userId: string }) {
  const { user, isUserLoading } = useAuth();
  const db = getFirestore(app);
  
  const requestsQuery = useMemo(() => {
    // Only construct the query if the user is loaded and authenticated.
    if (isUserLoading || !user) {
        return null;
    }
    
    return query(
      collection(db, 'verificationRequests'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [db, user, isUserLoading]);

  const { data: requests, isLoading } = useCollection<VerificationRequest>(requestsQuery);

  // Show skeleton if auth is loading OR if the query is valid and data is being fetched.
  const effectiveIsLoading = isUserLoading || (requestsQuery !== null && isLoading);

  if (effectiveIsLoading && !requests) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Verification Requests</CardTitle>
        <CardDescription>
          Here is the history of your document verification requests and lawyer feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {requests.map(request => (
            <VerificationRequestItem key={request.id} request={request} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
