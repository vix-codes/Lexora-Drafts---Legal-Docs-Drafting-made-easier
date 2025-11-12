'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/client';
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
}

export function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const handleAuthAction = async (data: FormValues) => {
    const auth = getAuth(app);
    const { email, password } = data;

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Add user profile to Firestore
        const db = getFirestore(app);
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          email: user.email,
          createdAt: serverTimestamp(),
        });
        
        toast({
          title: 'Account Created',
          description: "You've been successfully signed up!",
        });
        router.push('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed In',
          description: "Welcome back!",
        });
        router.push('/');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(handleAuthAction)} className="space-y-6">
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
      <Button disabled={isSubmitting} className="w-full" type="submit">
        {isSubmitting ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
      </Button>
    </form>
  );
}

// A new Button component to replace SubmitButton which relies on useFormStatus (for Server Actions)
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function FormSubmitButton({ children, disabled, ...props }: ButtonProps & { disabled: boolean }) {
  return (
    <Button {...props} type="submit" disabled={disabled}>
      {disabled ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}
