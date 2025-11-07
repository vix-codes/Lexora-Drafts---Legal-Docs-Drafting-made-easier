import Header from '@/components/header';
import LawFeed from '@/components/law-feed';
import HomeContent from '@/app/home-content';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <HomeContent>
        <LawFeed />
      </HomeContent>
    </div>
  );
}
