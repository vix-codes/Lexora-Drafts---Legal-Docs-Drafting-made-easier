
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { getUserRequests } from "@/app/actions";
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
import { ShieldQuestion } from "lucide-react";

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
};

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500 hover:bg-yellow-600" },
  reviewed: { label: "Reviewed", className: "bg-blue-500 hover:bg-blue-600" },
  approved: { label: "Approved", className: "bg-green-500 hover:bg-green-600" },
};

export default function MyRequestsPage() {
  const { user, isUserLoading } = useAuth();
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    if (user) {
      setIsLoading(true);
      getUserRequests(user.uid)
        .then((data) => {
          setRequests(data as VerificationRequest[]);
        })
        .catch((err) => {
          console.error("Failed to fetch requests:", err);
          setRequests([]); // Clear requests on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Not logged in
      setIsLoading(false);
      setRequests([]);
    }
  }, [user, isUserLoading]);

  const showLoading = isUserLoading || isLoading;

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
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </>
            )}

            {!showLoading && requests.length > 0 && requests.map((req) => {
                const statusInfo = statusConfig[req.status];
                return (
                  <div
                    key={req.id}
                    className="border rounded-lg p-4 space-y-3 hover:border-primary/80 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{req.documentType}</h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted{" "}
                          {req.createdAt
                            ? formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })
                            : "recently"}
                        </p>
                      </div>
                      {statusInfo && <Badge className={statusInfo.className}>{statusInfo.label}</Badge>}
                    </div>

                    {req.lawyerNotification && (
                      <div className="border-l-4 border-accent p-3 bg-accent/10 rounded-r-md">
                        <p className="font-semibold text-sm text-accent-foreground/90">
                          {req.lawyerNotification}
                        </p>
                      </div>
                    )}

                    {req.lawyerComments?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <h4 className="font-medium text-sm">
                          Lawyer’s Feedback:
                        </h4>
                        {req.lawyerComments
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
                  </div>
                );
              })}

            {!showLoading && requests.length === 0 && (
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
