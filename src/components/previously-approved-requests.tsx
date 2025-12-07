
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "./ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User } from "lucide-react";
import { documentTemplates } from "@/lib/data";
import type { WithId } from "@/firebase/firestore/use-collection";

type VerificationRequest = {
  documentType: string;
  updatedAt: { seconds: number; nanoseconds: number; };
  type?: 'document' | 'lawyer';
};

interface PreviouslyApprovedRequestsProps {
  requests: WithId<VerificationRequest>[];
}

function getDocumentLabel(docValue: string) {
    if (docValue === 'Lawyer Profile') return 'Lawyer Profile';
    const template = documentTemplates.find(t => t.value === docValue);
    return template ? template.label : docValue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function PreviouslyApprovedRequests({ requests }: PreviouslyApprovedRequestsProps) {
  return (
    <div className="pt-6">
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>
            <h3 className="text-lg font-semibold">Previously Approved ({requests.length})</h3>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {requests.map((request) => {
                const documentLabel = getDocumentLabel(request.documentType);
                return (
                    <div key={request.id} className="border p-4 rounded-lg bg-muted/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">{documentLabel}</p>
                                {request.type === 'lawyer' && (
                                  <p className="text-sm text-muted-foreground">Your professional profile is now active.</p>
                                )}
                            </div>
                            <Badge variant="outline" className="text-green-500 border-green-500 bg-background">Approved</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Approved {formatDistanceToNow(new Date(request.updatedAt.seconds * 1000), { addSuffix: true })}
                        </p>
                    </div>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
