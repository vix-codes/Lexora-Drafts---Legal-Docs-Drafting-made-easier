
'use client';

import Link from 'next/link';
import { AuthForm } from '@/firebase/auth/auth-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function LawyerSignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold tracking-tight">lexintel</h1>
          </div>
          <CardTitle>Join as a Legal Professional</CardTitle>
          <CardDescription>Create your profile to get discovered by clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="lawyer-signup" />
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center text-sm space-y-2">
            <p>
                Already have a lawyer account?{' '}
                <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
                </Link>
            </p>
            <p className="text-muted-foreground">
                Not a lawyer?{' '}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up as a user
                </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
