'use client';

import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} type="submit" disabled={props.disabled || pending}>
      {pending ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}
