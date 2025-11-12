'use client';

import { useFormState } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/submit-button';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
  action: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function AuthForm({ mode, action }: AuthFormProps) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(action, { success: false });
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: state.error,
      });
    }
  }, [state, toast, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          required
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          required
        />
        {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
      </div>
      <SubmitButton className="w-full">
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </SubmitButton>
    </form>
  );
}
