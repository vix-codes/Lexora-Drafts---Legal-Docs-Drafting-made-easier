'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/firebase/auth/auth-form';
import { signUpWithEmail } from '@/firebase/auth/mutations';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function SignupPage() {
  const router = useRouter();

  const handleSignup = async (values: { email: string; password: any }) => {
    const result = await signUpWithEmail(values.email, values.password);
    if (result.success) {
      router.push('/');
    }
    return result;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-2xl font-semibold tracking-tight">lawIntel</h1>
            </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Fill out the form below to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" onSubmit={handleSignup} />
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
