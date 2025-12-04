
'use client';

import Header from '@/components/header';
import { LawyerProfileCard } from '@/components/lawyer-profile-card';
import { useAuth } from '@/components/auth-provider';

export default function DashboardPage() {
    const { user } = useAuth();
    
    // Although AuthProvider handles redirection, this is a good safeguard
    if (!user) {
        return null; // Or a loading/error state
    }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 gap-6">
        <LawyerProfileCard />
      </main>
    </div>
  );
}
