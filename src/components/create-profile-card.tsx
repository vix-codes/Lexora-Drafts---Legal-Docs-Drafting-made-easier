'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PROFILE_URL = '/profile';

export function CreateProfileCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Lawyer Profile
        </CardTitle>
        <CardDescription>Are you a lawyer? Create or update your professional profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={PROFILE_URL}>
            Create Profile
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
