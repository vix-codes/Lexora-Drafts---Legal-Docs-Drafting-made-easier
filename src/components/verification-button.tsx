'use client';

import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { requestVerification } from '@/app/actions';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface VerificationButtonProps {
  userId: string;
  documentType: string;
  draftContent: string;
  formInputs: Record<string, any>;
}

export function VerificationButton({
  userId,
  documentType,
  draftContent,
  formInputs,
}: VerificationButtonProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    setIsSubmitting(true);
    try {
      // The action now might not throw directly but will use the emitter.
      // The client-side toast is now for optimistic UI feedback.
      await requestVerification(userId, documentType, draftContent, formInputs);
      
      toast({
        title: 'Request Sent',
        description: 'Your request has been sent to the lawyer for verification.',
      });

    } catch (error: any) {
      // This catch block might still be useful for network errors or other non-permission issues.
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: error.message || 'Could not send verification request.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isSubmitting} className="w-full">
      {isSubmitting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      Verify with Lawyer
    </Button>
  );
}
