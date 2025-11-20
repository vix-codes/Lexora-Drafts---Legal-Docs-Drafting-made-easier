import Header from '@/components/header';
import LegalPrecedents from '@/components/legal-precedents';
import HomeContent from '@/app/home-content';
import NewsTicker from '@/components/news-ticker';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function NewsTickerLoading() {
  return <Skeleton className="h-12 w-full" />;
}

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <HomeContent>
        <LegalPrecedents />
      </HomeContent>
      {/* The news ticker is removed because it relies on the animation that was causing the error. */}
      {/* <div className="px-4 lg:px-6 pb-6">
        <Suspense fallback={<NewsTickerLoading />}>
          <NewsTicker />
        </Suspense>
      </div> */}
    </div>
  );
}
