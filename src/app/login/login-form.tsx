'use client';

import Link from 'next/link';
import { AuthForm } from '@/firebase/auth/auth-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import type { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

export default function LoginForm({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-stretch bg-background">
      <div className="hidden lg:flex lg:w-1/2 auth-bg">
        <div className="auth-content text-foreground">
            <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="font-headline text-2xl font-semibold tracking-tight">lexintel</h1>
            </div>
            <div>
                <h2 className="font-headline text-3xl font-semibold mb-4">Stay Ahead of the Curve</h2>
                <p className="text-muted-foreground mb-8">
                    Get summaries of the latest legal developments in India.
                </p>
                {children}
            </div>
            <div className="text-xs text-muted-foreground">
                &copy; {new Date().getFullYear()} lexintel. All rights reserved.
            </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center p-4 lg:w-1/2 bg-card">
        <Card className="w-full max-w-sm border-0 lg:border bg-card shadow-none lg:shadow-sm">
          <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-3 mb-4 lg:hidden">
                  <Logo className="h-8 w-8 text-primary" />
                  <h1 className="font-headline text-2xl font-semibold tracking-tight">lexintel</h1>
              </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="login" />
          </CardContent>
          <CardFooter className="flex-col justify-center text-sm gap-4">
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
