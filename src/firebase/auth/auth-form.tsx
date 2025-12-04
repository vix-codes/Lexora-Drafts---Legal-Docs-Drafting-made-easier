
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { lawyers } from '@/lib/data';

const baseSchema = {
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
};

const lawyerSchema = z.object({
  ...baseSchema,
  name: z.string().min(2, { message: 'Full name is required.' }),
  enrollmentNumber: z.string().min(1, { message: 'Enrollment number is required.' }),
  stateBarCouncil: z.string().min(1, { message: 'Please select your bar council.' }),
});

const userSchema = z.object(baseSchema);

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
  mode: 'login' | 'signup' | 'lawyer-signup';
}

const allStateBarCouncils = [
    "Andhra Pradesh", "Assam, Nagaland, Mizoram, Arunachal Pradesh & Sikkim", "Bihar", "Chhattisgarh", "Delhi", "Gujarat", "Himachal Pradesh", "Jammu & Kashmir and Ladakh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra & Goa", "Manipur", "Meghalaya", "Odisha", "Patna", "Punjab & Haryana", "Rajasthan", "Tamil Nadu & Puducherry", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function AuthForm({ mode }: AuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const isLawyerSignup = mode === 'lawyer-signup';
  const schema = isLawyerSignup ? lawyerSchema : userSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const handleAuthAction = async (data: z.infer<typeof schema>) => {
    const auth = getAuth(app);
    const { email, password } = data;

    try {
      if (mode === 'signup' || mode === 'lawyer-signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const db = getFirestore(app);

        if (mode === 'lawyer-signup') {
            const lawyerData = data as z.infer<typeof lawyerSchema>;
            const lawyerRef = doc(db, 'lawyers', user.uid);
            const newLawyerProfile = {
                id: user.uid,
                email: user.email!,
                name: lawyerData.name,
                enrollmentNumber: lawyerData.enrollmentNumber,
                stateBarCouncil: lawyerData.stateBarCouncil,
                createdAt: serverTimestamp(),
                isVerified: true, // Auto-verified for mock purposes
                phone: '',
                location: { city: '', state: '' },
                specializations: ['General Practice'],
                experience: 1,
                description: 'Newly registered lawyer. Please complete your profile.',
                rating: 4.0,
                source: 'internal' as const,
            };
            await setDoc(lawyerRef, newLawyerProfile);

            // Add to mock data to show in UI immediately
            lawyers.unshift({
                ...newLawyerProfile,
                // @ts-ignore
                createdAt: new Date(),
            });


            toast({
                title: 'Account Created',
                description: "Welcome! Please complete your profile.",
            });
            router.push('/profile'); // Redirect to profile page
        } else {
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
            router.push('/');
        }
      } else { // Login
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: 'Signed In',
          description: "Welcome back!",
        });
        router.push('/');
      }
    } catch (error: any) {
      let description = 'An unexpected error occurred.';
      if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                description = 'No account found with this email. Please sign up.';
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
      {isLawyerSignup && (
        <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
                id="name"
                type="text"
                placeholder="e.g. Jane Doe"
                {...register('name')}
                required
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{(errors.name as any).message}</p>}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          required
          autoComplete="email"
        />
        {errors.email && <p className="text-destructive text-sm mt-1">{(errors.email as any).message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register('password')}
          required
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        />
        {errors.password && <p className="text-destructive text-sm mt-1">{(errors.password as any).message}</p>}
      </div>

      {isLawyerSignup && (
        <>
            <div className="space-y-2">
                <Label htmlFor="enrollmentNumber">Bar Council Enrollment Number</Label>
                <Input
                    id="enrollmentNumber"
                    type="text"
                    placeholder="e.g., MAH/1234/2010"
                    {...register('enrollmentNumber')}
                    required
                />
                {errors.enrollmentNumber && <p className="text-destructive text-sm mt-1">{(errors.enrollmentNumber as any).message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="stateBarCouncil">State Bar Council</Label>
                 <Controller
                    name="stateBarCouncil"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <SelectTrigger id="stateBarCouncil">
                                <SelectValue placeholder="Select your state bar council..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allStateBarCouncils.map(council => (
                                <SelectItem key={council} value={council}>
                                    {council}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.stateBarCouncil && <p className="text-destructive text-sm mt-1">{(errors.stateBarCouncil as any).message}</p>}
            </div>
        </>
      )}

      <FormSubmitButton isSubmitting={isSubmitting}>
        {mode === 'login' ? 'Log In' : 'Sign Up'}
      </FormSubmitButton>
    </form>
  );
}
