'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { approveRequest, addLawyerComment } from '@/app/actions';
import { type WithId } from '@/firebase/firestore/use-collection';
import { ScrollArea } from './ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

type VerificationRequest = {
  userId: string;
  documentType: string;
  status: 'pending' | 'reviewed' | 'approved';
  createdAt: { seconds: number; nanoseconds: number };
  draftContent: string;
  formInputs: Record<string, any>;
  lawyerComments: { text: string; timestamp: { seconds: number, nanoseconds: number } }[];
};

interface LawyerRequestDetailsProps {
  request: WithId<VerificationRequest>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function LawyerRequestDetails({ request, isOpen, onOpenChange }: LawyerRequestDetailsProps) {
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendAdvice = async () => {
    if (!comment.trim()) {
      toast({ variant: 'destructive', title: 'Comment cannot be empty.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addLawyerComment(request.id, comment);
      if (result.success) {
        toast({ title: 'Advice Sent', description: result.message });
        setComment('');
        onOpenChange(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await approveRequest(request.id);
      if (result.success) {
        toast({ title: 'Draft Approved', description: result.message });
        onOpenChange(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Draft: {request.documentType}</DialogTitle>
          <DialogDescription>
            Review the user's generated draft, the inputs provided, and provide feedback or approval.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Left Side: Draft and Comments */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">Generated Draft</h3>
            <ScrollArea className="rounded-md border p-4 flex-1 bg-muted/50">
              <pre className="text-sm whitespace-pre-wrap font-body">{request.draftContent}</pre>
            </ScrollArea>
            <div className="space-y-2">
              <h3 className="font-semibold">Add Comments / Advice</h3>
              <Textarea
                placeholder="Provide your legal advice or suggest changes here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={5}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Right Side: Inputs and History */}
          <div className="flex flex-col gap-4">
            <h3 className="font-semibold">User-Provided Inputs</h3>
            <ScrollArea className="rounded-md border p-4 flex-1 bg-muted/50">
              <div className="space-y-2 text-sm">
                {Object.entries(request.formInputs).map(([key, value]) => (
                  <div key={key}>
                    <strong className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {String(value)}
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <h3 className="font-semibold">Comments History</h3>
            <ScrollArea className="rounded-md border p-4 flex-1 bg-muted/50">
                {request.lawyerComments && request.lawyerComments.length > 0 ? (
                    <div className="space-y-3">
                        {request.lawyerComments.map((c, i) => (
                           <div key={i} className="p-3 rounded-md bg-muted/50 border">
                              <p className="text-sm">{c.text}</p>
                              {c.timestamp && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(c.timestamp.seconds * 1000), { addSuffix: true })}
                                </p>
                              )}
                           </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isSubmitting}>Cancel</Button>
          </DialogClose>
          <Button
            variant="outline"
            onClick={handleSendAdvice}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Advice
          </Button>
          <Button onClick={handleApprove} disabled={isSubmitting || request.status === 'approved'}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {request.status === 'approved' ? 'Approved' : 'Approve Draft'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
