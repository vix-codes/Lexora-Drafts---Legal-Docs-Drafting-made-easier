
'use client';

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
import { Button, type ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

function FormSubmitButton({ children, isSubmitting, ...props }: ButtonProps & { isSubmitting: boolean }) {
  return (
    <Button {...props} type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? <Loader2 className="animate-spin" /> : children}
    </Button>
  );
}

function getUsernameFromEmail(email: string) {
    return email.split('@')[0];
}

type AuthFormProps = {
  mode: 'login' | 'signup';
}

const LAWYER_EMAIL = 'lawyer@lexintel.com';

export function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(authSchema),
  });

  const handleAuthAction = async (data: z.infer<typeof authSchema>) => {
    const auth = getAuth(app);
    const { email, password } = data;

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = getFirestore(app);

        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            email: user.email,
            username: getUsernameFromEmail(user.email!),
            createdAt: serverTimestamp(),
        });
        toast({
            title: 'Account Created',
            description: "You've been successfully signed up!",
        });
        // No redirect here, AuthProvider will handle it
      } else { // Login
        await signInWithEmailAndPassword(auth, email, password);
        
        if (email === LAWYER_EMAIL) {
          toast({
            title: 'Lawyer Portal Access',
            description: "Welcome back, counselor.",
          });
        } else {
          toast({
            title: 'Signed In',
            description: "Welcome back!",
          });
        }
        // No redirect here, AuthProvider will handle it
      }
    } catch (error: any) {
      let description = 'An unexpected error occurred.';
      if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/invalid-credential':
                description = 'Incorrect email or password. Please try again.';
                break;
            case 'auth/wrong-password':
                description = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                description = 'This email is already in use. Please log in.';
                break;
            case 'auth/network-request-failed':
                description = 'Network error. Please check your connection and authorized domains in Firebase.';
                break;
            default:
                description = error.message;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: description,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleAuthAction)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          required
          autoComplete="email"
          className="bg-background border-input text-foreground"
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="bg-background border-input text-foreground"
        />
        {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
      </div>

      <FormSubmitButton isSubmitting={isSubmitting}>
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </FormSubmitButton>
    </form>
  );
}
