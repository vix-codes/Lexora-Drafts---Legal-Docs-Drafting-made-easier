'use client';

import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

const FIND_LAWYER_BASE_URL = 'https://intelgpt.vercel.app/find-lawyer';

export default function HomeContent({ children }: { children: ReactNode }) {
  const handleLawyerSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const location = formData.get('location') as string;
    if (location) {
      const searchUrl = `${FIND_LAWYER_BASE_URL}?location=${encodeURIComponent(location)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <main className="flex-1 grid md:grid-cols-[7fr_3fr] gap-6 lg:gap-8 p-4 lg:p-6">
      <div className="flex flex-col gap-6 lg:gap-8 min-w-0">
        <MainContent />
      </div>
      <aside className="flex flex-col gap-6 lg:gap-8">
        <Lawbot />
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find a Lawyer
            </CardTitle>
            <CardDescription>Search for legal professionals in your area.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLawyerSearch} className="flex flex-col gap-4">
              <Input name="location" placeholder="Enter city or area..." required />
              <Button type="submit" className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search Lawyers
              </Button>
            </form>
          </CardContent>
        </Card>
        {children}
      </aside>
    </main>
  );
}
