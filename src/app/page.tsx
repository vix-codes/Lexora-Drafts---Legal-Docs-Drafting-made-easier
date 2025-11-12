'use client'

import Header from '@/components/header';
import LegalPrecedents from '@/components/legal-precedents';
import HomeContent from '@/app/home-content';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
            <div>Loading...</div>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <HomeContent>
        <LegalPrecedents />
      </HomeContent>
    </div>
  );
}
