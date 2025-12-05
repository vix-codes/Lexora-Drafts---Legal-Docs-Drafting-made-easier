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
      await addLawyerComment(request.id, comment);
      toast({ title: 'Advice Sent', description: "The user has been notified of your comments." });
      setComment('');
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveRequest(request.id);
      toast({ title: 'Draft Approved', description: "The user has been notified." });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-headline">Review Draft: {request.documentType}</DialogTitle>
          <DialogDescription>
            Review the user's generated draft and provide feedback or approval.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 px-6 flex-1 min-h-0">
          {/* Left Column: Draft */}
          <div className="flex flex-col gap-2 min-h-0">
            <h3 className="font-semibold text-foreground">Generated Draft</h3>
            <div className="rounded-md border bg-muted/30 flex-1">
              <ScrollArea className="h-full">
                <pre className="text-sm whitespace-pre-wrap font-body p-4">{request.draftContent}</pre>
              </ScrollArea>
            </div>
          </div>

          {/* Right Column: Inputs & History */}
          <div className="flex flex-col gap-4 min-h-0">
            <div className="flex flex-col gap-2 flex-1 min-h-0">
                <h3 className="font-semibold text-foreground">User-Provided Inputs</h3>
                <div className="rounded-md border p-4 bg-muted/30 flex-1">
                  <ScrollArea className="h-full">
                    <div className="space-y-2 text-sm">
                      {Object.entries(request.formInputs).map(([key, value]) => (
                        <div key={key} className="flex">
                          <strong className="font-medium capitalize w-1/3">{key.replace(/([A-Z])/g, ' $1')}:</strong>
                          <span className="text-muted-foreground w-2/3">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
            </div>
            
            <div className="flex flex-col gap-2 flex-1 min-h-0">
                <h3 className="font-semibold text-foreground">Comments History</h3>
                <div className="rounded-md border p-4 bg-muted/30 flex-1">
                  <ScrollArea className="h-full">
                      {request.lawyerComments && request.lawyerComments.length > 0 ? (
                          <div className="space-y-3">
                              {request.lawyerComments.slice().reverse().map((c, i) => (
                                <div key={i} className="p-3 rounded-md bg-background/50 border">
                                    <p className="text-sm">{c.text}</p>
                                    {c.timestamp && (
                                      <p className="text-xs text-muted-foreground mt-2">
                                        {formatDistanceToNow(new Date(c.timestamp.seconds * 1000), { addSuffix: true })}
                                      </p>
                                    )}
                                </div>
                              ))}
                          </div>
                      ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-muted-foreground">No comments yet.</p>
                          </div>
                      )}
                  </ScrollArea>
                </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t mt-4 bg-background/95 sticky bottom-0">
           <div className="w-full flex items-start gap-4">
                <Textarea
                    placeholder="Add a new comment or suggest changes here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="flex-1"
                    disabled={isSubmitting}
                />
                <div className="flex flex-col gap-2">
                     <Button
                        variant="outline"
                        onClick={handleSendAdvice}
                        disabled={isSubmitting || !comment.trim()}
                        className="w-[120px]"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Advice
                    </Button>
                    <Button onClick={handleApprove} disabled={isSubmitting || request.status === 'approved'} className="w-[120px]">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {request.status === 'approved' ? 'Approved' : 'Approve'}
                    </Button>
                </div>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
