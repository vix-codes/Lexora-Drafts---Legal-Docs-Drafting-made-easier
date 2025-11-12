'use client';

import Link from 'next/link';
import { AuthForm } from '@/firebase/auth/auth-form';
import { signInWithEmail } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-2xl font-semibold tracking-tight">lawIntel</h1>
            </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" action={signInWithEmail} />
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
