'use client';

import Header from '@/components/header';
import { LawyerProfileCard } from '@/components/lawyer-profile-card';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LawyerProfileCard />
        {/* You can add more lawyer-specific dashboard components here */}
      </main>
    </div>
  );
}
