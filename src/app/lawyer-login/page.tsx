'use client';

import { AuthForm } from '@/firebase/auth/auth-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';

export default function LawyerLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md bg-card">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-2xl font-semibold tracking-tight">lexintel</h1>
          </div>
          <CardTitle>Lawyer Portal Access</CardTitle>
          <CardDescription>Enter your designated credentials to access the verification panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="lawyer-login" />
        </CardContent>
      </Card>
    </div>
  );
}
