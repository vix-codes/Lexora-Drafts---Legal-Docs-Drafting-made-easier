import Header from '@/components/header';
import LawFeed from '@/components/law-feed';
import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';

const FIND_LAWYER_URL = 'https://intelgpt.vercel.app/find-lawyer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 grid md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
        <div className="flex flex-col gap-6 lg:gap-8 min-w-0">
          <MainContent />
        </div>
        <aside className="hidden md:flex flex-col gap-6 lg:gap-8">
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
              <Link href={FIND_LAWYER_URL} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Expand to search lawyers
                </Button>
              </Link>
            </CardContent>
          </Card>
          <LawFeed />
        </aside>
      </main>
    </div>
  );
}
