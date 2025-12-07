
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserRequests, requestVerification } from "@/app/actions";
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

type VerificationRequest = {
  id: string;
  userId: string;
  documentType: string;
  status: "pending" | "reviewed" | "approved";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  draftContent: string;
  formInputs: Record<string, any>;
  lawyerComments: { text: string; timestamp: string }[];
  lawyerNotification: string;
  type?: 'document' | 'lawyer';
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500 hover:bg-yellow-600" },
  reviewed: { label: "Reviewed", className: "bg-blue-500 hover:bg-blue-600" },
  approved: { label: "Approved", className: "bg-green-500 hover:bg-green-600" },
};

function RequestCard({ request, onResubmit }: { request: VerificationRequest, onResubmit: () => void }) {
  const { toast } = useToast();
  const [editingContent, setEditingContent] = useState(request.draftContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusInfo = statusConfig[request.status];

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
        onResubmit(); // Trigger a refetch of requests in the parent component
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
          <h3 className="font-semibold">{request.documentType}</h3>
          <p className="text-sm text-muted-foreground">
            Submitted{" "}
            {request.createdAt
              ? formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })
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
  const [requests, setRequests] = useState<VerificationRequest[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Used to trigger re-fetch

  const fetchRequests = () => {
    if (user) {
      setIsLoading(true);
      getUserRequests(user.uid)
        .then((data) => {
          setRequests(data); // Can be null
        })
        .catch((err) => {
          console.error("Failed to fetch requests:", err);
          setRequests([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
      setRequests([]);
    }
  }

  useEffect(() => {
    if (!isUserLoading) {
      fetchRequests();
    }
  }, [user, isUserLoading, fetchTrigger]);

  const handleResubmitSuccess = () => {
    setFetchTrigger(prev => prev + 1); // Increment to trigger useEffect
  }

  const showLoading = isUserLoading || isLoading;
  const isFeatureDisabled = requests === null;

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
              Track your document and profile submissions and lawyer feedback.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {showLoading && (
              <>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </>
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

            {!showLoading && requests && requests.length > 0 && requests.map((req) => (
                <RequestCard key={req.id} request={req} onResubmit={handleResubmitSuccess} />
            ))}

            {!showLoading && requests && requests.length === 0 && (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="font-semibold">No Requests Found</p>
                <p className="text-sm">
                  You have not submitted any verification requests yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
