'use client';

import Link from 'next/link';
import { AuthForm } from '@/firebase/auth/auth-form';
import { signUpWithEmail } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import LawFeed from './law-feed';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function LawFeedLoading() {
    return (
        <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
            ))}
        </div>
    )
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-stretch bg-background">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-card p-8 text-card-foreground">
        <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold tracking-tight">lawIntel</h1>
        </div>
        <div>
            <h2 className="font-headline text-3xl font-semibold mb-4">Stay Ahead of the Curve</h2>
            <p className="text-muted-foreground mb-8">
                Get summaries of the latest legal developments in India.
            </p>
            <Suspense fallback={<LawFeedLoading />}>
                {/* @ts-expect-error Server Component */}
                <LawFeed />
            </Suspense>
        </div>
        <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} lawIntel. All rights reserved.
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2">
        <Card className="w-full max-w-sm border-0 lg:border">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-3 mb-4 lg:hidden">
                    <Logo className="h-8 w-8 text-primary" />
                    <h1 className="font-headline text-2xl font-semibold tracking-tight">lawIntel</h1>
                </div>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Fill out the form below to get started.</CardDescription>
            </CardHeader>
            <CardContent>
            <AuthForm mode="signup" action={signUpWithEmail} />
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
    </div>
  );
}
