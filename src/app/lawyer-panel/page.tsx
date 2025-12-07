'use client';

import { useMemo, useState, useEffect } from 'react';
import { collection, query, orderBy, getFirestore, where } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useCollection, type WithId } from '@/firebase/firestore/use-collection';
import Header from '@/components/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { LawyerRequestDetails } from '@/components/lawyer-request-details';
import { Button } from '@/components/ui/button';
import { Briefcase, CheckCircle, Clock, MessageSquare, User } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { PreviouslyApprovedRequests } from '@/components/previously-approved-requests';
import { getUserProfiles } from '@/app/actions';
import { documentTemplates } from '@/lib/data';

type VerificationRequest = {
  userId: string;
  documentType: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: { seconds: number; nanoseconds: number };
  draftContent: string;
  formInputs: Record<string, any>;
  lawyerComments: { text: string; timestamp: { seconds: number } }[];
  type?: 'document' | 'lawyer';
};

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, className: 'bg-yellow-500 hover:bg-yellow-600' },
  reviewed: { label: 'Reviewed', icon: MessageSquare, className: 'bg-blue-500 hover:bg-blue-600' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-500 hover:bg-green-600' },
};

function getDocumentLabel(docValue: string) {
    if (docValue === 'Lawyer Profile') return 'Lawyer Profile';
    const template = documentTemplates.find(t => t.value === docValue);
    return template ? template.label : docValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function VerificationRequestCard({ request, username }: { request: WithId<VerificationRequest>, username: string }) {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const statusInfo = statusConfig[request.status];
    const documentLabel = getDocumentLabel(request.documentType);

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>{documentLabel}</CardTitle>
                            <CardDescription className="flex items-center gap-1 pt-1">
                                <User className="h-3 w-3" />
                                {username}
                            </CardDescription>
                        </div>
                        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {request.createdAt ? formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                    </p>
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => setIsDetailsOpen(true)}>View Details</Button>
                    </div>
                </CardContent>
            </Card>
            <LawyerRequestDetails 
                request={request}
                username={username}
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </>
    );
}

export default function LawyerPanelPage() {
  const { user, isUserLoading } = useAuth();
  const db = getFirestore(app);
  
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
  const isLawyer = !isUserLoading && user?.email === 'lawyer@lexintel.com';

  const pendingRequestsQuery = useMemo(() => {
    if (isUserLoading || !isLawyer) return null;
    return query(
        collection(db, 'verificationRequests'), 
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
    );
  }, [db, isUserLoading, isLawyer]);

  const reviewedRequestsQuery = useMemo(() => {
    if (isUserLoading || !isLawyer) return null;
    return query(
        collection(db, 'verificationRequests'), 
        where('status', '==', 'reviewed'),
        orderBy('createdAt', 'desc')
    );
  }, [db, isUserLoading, isLawyer]);

  const approvedRequestsQuery = useMemo(() => {
    if (isUserLoading || !isLawyer) return null;
    return query(
        collection(db, 'verificationRequests'), 
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
    );
  }, [db, isUserLoading, isLawyer]);

  const { data: pendingRequests, isLoading: isLoadingPending } = useCollection<VerificationRequest>(pendingRequestsQuery);
  const { data: reviewedRequests, isLoading: isLoadingReviewed } = useCollection<VerificationRequest>(reviewedRequestsQuery);
  const { data: approvedRequests, isLoading: isLoadingApproved } = useCollection<VerificationRequest>(approvedRequestsQuery);

  const activeRequests = useMemo(() => {
    const combined = [...(reviewedRequests || []), ...(pendingRequests || [])];
    // This sort ensures 'reviewed' items appear before 'pending' items.
    combined.sort((a, b) => {
        if (a.status === 'reviewed' && b.status !== 'reviewed') return -1;
        if (a.status !== 'reviewed' && b.status === 'reviewed') return 1;
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
    });
    return combined;
  }, [pendingRequests, reviewedRequests]);

  useEffect(() => {
    const allRequests = [...(activeRequests || []), ...(approvedRequests || [])];
    if (allRequests.length > 0) {
        const userIds = [...new Set(allRequests.map(r => r.userId))];
        getUserProfiles(userIds).then(profiles => {
            setUserProfiles(profiles);
        });
    }
  }, [activeRequests, approvedRequests]);
  
  if (!isUserLoading && !isLawyer) {
      return (
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-1 p-4 lg:p-6">
                <div className="text-center py-12 text-destructive">
                    <p>Access Denied. You do not have permission to view this page.</p>
                </div>
            </main>
          </div>
      );
  }

  const effectiveIsLoading = isUserLoading || isLoadingPending || isLoadingReviewed || isLoadingApproved;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Lawyer Verification Panel
                </CardTitle>
                <CardDescription>Review and manage all user-submitted draft verification requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 {effectiveIsLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-48 w-full" />
                    </div>
                 )}
                 {!effectiveIsLoading && activeRequests && activeRequests.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeRequests.map(request => (
                            <VerificationRequestCard key={request.id} request={request} username={userProfiles[request.userId] || '...'} />
                        ))}
                     </div>
                 )}
                 {!effectiveIsLoading && (!activeRequests || activeRequests.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="font-semibold">No Active Requests</p>
                        <p>There are currently no pending or reviewed requests.</p>
                    </div>
                 )}

                {!effectiveIsLoading && approvedRequests && approvedRequests.length > 0 && (
                    <PreviouslyApprovedRequests requests={approvedRequests} profiles={userProfiles} />
                )}

            </CardContent>
        </Card>
      </main>
    </div>
  );
}
