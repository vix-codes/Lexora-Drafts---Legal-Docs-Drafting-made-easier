
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export function LawyerProfilePromptCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleClick = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <>
      <Card
        onClick={handleClick}
        className="h-full bg-card hover:border-secondary transition-colors hover:shadow-lg cursor-pointer group"
      >
        <CardHeader className="flex flex-row items-center gap-4">
          <Briefcase className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-xl">Create a Lawyer Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Build a public profile to showcase your specialization, contact details, and get discovered by clients.
          </p>
        </CardContent>
      </Card>

      <AlertDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please log in or create an account to build your professional lawyer profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <div className="flex gap-2">
                <Button variant="outline" asChild>
                    <Link href="/signup">Create Account</Link>
                </Button>
                <AlertDialogAction asChild>
                    <Link href="/login">Log In</Link>
                </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
