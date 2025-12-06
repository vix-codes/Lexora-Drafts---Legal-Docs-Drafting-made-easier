
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";

type VerificationRequest = {
  id: string;
  userId: string;
  documentType: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: { seconds: number; nanoseconds: number };
  // other fields...
};


interface PreviouslyApprovedRequestsProps {
  requests: VerificationRequest[];
}

export function PreviouslyApprovedRequests({ requests }: PreviouslyApprovedRequestsProps) {
  return (
    <div className="pt-6">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h3 className="text-lg font-semibold">Previously Approved Requests ({requests.length})</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {requests.map((request) => (
                <div key={request.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                      <div>
                          <p className="font-semibold">{request.documentType}</p>
                          <p className="text-sm text-muted-foreground">User: {request.userId}</p>
                      </div>
                      <Badge variant="outline" className="text-green-500 border-green-500">Approved</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Approved {formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
