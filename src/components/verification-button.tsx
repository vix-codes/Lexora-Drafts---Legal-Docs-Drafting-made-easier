
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
      const result = await requestVerification(userId, documentType, draftContent, formInputs);
      
      if (result.success) {
        toast({
          title: 'Request Sent',
          description: 'Your request has been sent to the lawyer for verification.',
        });
      } else {
         // This else block might not be reached if the action always throws on error,
         // but it's good practice to have it.
         toast({
          variant: 'destructive',
          title: 'Submission Failed',
          description: result.error || 'An unknown error occurred.',
        });
      }

    } catch (error: any) {
      // This will catch the error thrown from the server action.
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
