
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { requestVerification } from "@/app/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Header from "@/components/header";
import { ShieldQuestion, Edit, Send, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCollection, type WithId } from "@/firebase/firestore/use-collection";
import { collection, query, where, orderBy, getFirestore } from "firebase/firestore";
import { app } from "@/firebase/client";
import { PreviouslyApprovedRequests } from "@/components/previously-approved-requests";
import { documentTemplates } from "@/lib/data";

type VerificationRequest = {
  userId: string;
  documentType: string;
  status: "pending" | "reviewed" | "approved";
  createdAt: { seconds: number; nanoseconds: number; };
  updatedAt: { seconds: number; nanoseconds: number; };
  draftContent: string;
  formInputs: Record<string, any>;
  lawyerComments: { text: string; timestamp: { seconds: number; nanoseconds: number; } }[];
  lawyerNotification: string;
  type?: 'document' | 'lawyer';
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500 hover:bg-yellow-600" },
  reviewed: { label: "Reviewed", className: "bg-blue-500 hover:bg-blue-600" },
  approved: { label: "Approved", className: "bg-green-500 hover:bg-green-600" },
};

function getDocumentLabel(docValue: string) {
    if (docValue === 'Lawyer Profile') return 'Lawyer Profile';
    const template = documentTemplates.find(t => t.value === docValue);
    return template ? template.label : docValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


function RequestCard({ request, onResubmit }: { request: WithId<VerificationRequest>, onResubmit: () => void }) {
  const { toast } = useToast();
  const [editingContent, setEditingContent] = useState(request.draftContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusInfo = statusConfig[request.status];
  const documentLabel = getDocumentLabel(request.documentType);

  const handleResubmit = async () => {
    if (!editingContent.trim()) {
      toast({ variant: "destructive", title: "Draft cannot be empty." });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await requestVerification(
        request.userId,
        request.documentType,
        editingContent,
        request.formInputs
      );
      if (result.success) {
        toast({ title: "Resubmitted Successfully", description: "Your updated draft has been sent for review." });
        setIsEditing(false);
        onResubmit();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Resubmission Failed", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:border-primary/80 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{documentLabel}</h3>
          <p className="text-sm text-muted-foreground">
            Submitted{" "}
            {request.createdAt
              ? formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true })
              : "recently"}
          </p>
        </div>
        {statusInfo && <Badge className={statusInfo.className}>{statusInfo.label}</Badge>}
      </div>

      {request.lawyerNotification && (
        <div className="border-l-4 border-accent p-3 bg-accent/10 rounded-r-md">
          <p className="font-semibold text-sm text-accent-foreground/90">
            {request.lawyerNotification}
          </p>
        </div>
      )}

      {request.lawyerComments?.length > 0 && (
        <div className="mt-3 space-y-2">
          <h4 className="font-medium text-sm">Lawyer’s Feedback:</h4>
          {request.lawyerComments
            .slice()
            .reverse()
            .map((c, i) => (
              <blockquote
                key={i}
                className="text-sm text-muted-foreground border-l-2 pl-3 italic"
              >
                "{c.text}"
              </blockquote>
            ))}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3 pt-2">
          <Textarea 
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            rows={10}
            className="bg-background"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleResubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Resubmit for Verification
            </Button>
          </div>
        </div>
      ) : (
        !isEditing && request.status === 'reviewed' && request.type === 'document' && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit & Resubmit
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export default function MyRequestsPage() {
  const { user, isUserLoading } = useAuth();
  const db = getFirestore(app);

  const userRequestsQuery = useMemo(() => {
      if (!user) return null;
      return query(
          collection(db, 'verificationRequests'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
      );
  }, [db, user]);

  const { data: allRequests, isLoading: isRequestsLoading } = useCollection<VerificationRequest>(userRequestsQuery);

  const activeRequests = useMemo(() => {
    return allRequests?.filter(r => r.status === 'pending' || r.status === 'reviewed') ?? [];
  }, [allRequests]);
  
  const approvedRequests = useMemo(() => {
    return allRequests?.filter(r => r.status === 'approved') ?? [];
  }, [allRequests]);

  const showLoading = isUserLoading || (user && isRequestsLoading);
  
  const isFeatureDisabled = allRequests === null && !isRequestsLoading && user;

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
              Track your document and profile submissions and lawyer feedback in real time.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {showLoading && (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            )}
            
            {isFeatureDisabled && (
              <div className="text-center py-12 text-yellow-500 border-2 border-dashed border-yellow-500/50 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="mx-auto h-10 w-10 mb-4" />
                <p className="font-semibold">Feature Disabled in Preview</p>
                <p className="text-sm max-w-md mx-auto">
                    This feature requires server functions that are not available in this preview environment. Please deploy to view your requests.
                </p>
              </div>
            )}

            {!showLoading && !isFeatureDisabled && activeRequests.length > 0 && (
                <div className="space-y-4">
                    {activeRequests.map((req) => (
                        <RequestCard key={req.id} request={req} onResubmit={() => {}} />
                    ))}
                </div>
            )}
            
            {!showLoading && !isFeatureDisabled && activeRequests.length === 0 && approvedRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="font-semibold">No Active Requests</p>
                <p className="text-sm">
                  You have not submitted any pending verification requests yet.
                </p>
              </div>
            )}

            {!showLoading && !isFeatureDisabled && approvedRequests.length > 0 && (
                <PreviouslyApprovedRequests requests={approvedRequests} />
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
}
