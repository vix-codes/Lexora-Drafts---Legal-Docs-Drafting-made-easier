"use client";

import { useAuth } from "@/components/auth-provider";
import { collection, query, where, orderBy, getFirestore } from "firebase/firestore";
import { useCollection, type WithId } from "@/firebase/firestore/use-collection";
import { app } from "@/firebase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/header";
import { ShieldQuestion } from "lucide-react";
import { useMemo } from "react";

type VerificationRequest = {
  userId: string;
  documentType: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: { seconds: number; nanoseconds: number };
  draftContent: string;
  formInputs: Record<string, any>;
  lawyerComments: { text: string; timestamp: { seconds: number } }[];
  lawyerNotification: string;
};

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-yellow-500 hover:bg-yellow-600' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-500 hover:bg-blue-600' },
  approved: { label: 'Approved', className: 'bg-green-500 hover:bg-green-600' },
};

export default function MyRequestsPage() {
  const { user, isUserLoading } = useAuth();
  const db = getFirestore(app);

  // HARD GUARD to prevent early Firestore queries
  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          <Card>
            <CardHeader>
              <CardTitle>My Verification Requests</CardTitle>
              <CardDescription>Loading your requests…</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Only compute query AFTER user is guaranteed loaded
  const requestsQuery = useMemo(() => {
    return query(
      collection(db, "verificationRequests"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user.uid]);

  // Now safe to call useCollection
  const { data: requests, isLoading } = useCollection<VerificationRequest>(requestsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <ShieldQuestion className="h-6 w-6 text-primary" />
              My Verification Requests
            </CardTitle>
            <CardDescription>
              Here is the history of your document verification requests and lawyer feedback.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading && (
              <>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </>
            )}

            {!isLoading && requests && requests.length > 0 && (
              requests.map((req) => {
                const statusInfo = statusConfig[req.status];

                return (
                  <div key={req.id} className="border rounded-lg p-4 space-y-3 hover:border-primary/80">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{req.documentType}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDistanceToNow(new Date(req.createdAt.seconds * 1000), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                    </div>

                    {req.lawyerNotification && (
                      <div className="border-l-4 border-accent p-3 bg-accent/10 rounded-r-md">
                        <p className="font-semibold text-sm">{req.lawyerNotification}</p>
                      </div>
                    )}

                    {req.lawyerComments?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="font-medium text-sm">Lawyer's Feedback:</h4>
                        {req.lawyerComments.slice().reverse().map((c, i) => (
                          <blockquote key={i} className="text-sm text-muted-foreground border-l-2 pl-3 italic">
                            {c.text}
                          </blockquote>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {!isLoading && (!requests || requests.length === 0) && (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="font-semibold">No Requests Found</p>
                <p className="text-sm">You have not submitted any documents for verification yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
