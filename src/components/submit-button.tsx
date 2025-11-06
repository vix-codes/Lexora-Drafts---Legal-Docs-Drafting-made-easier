'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles />
          Generate Draft
        </>
      )}
    </Button>
  );
}
