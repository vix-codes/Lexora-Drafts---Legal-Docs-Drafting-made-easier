import Header from '@/components/header';
import LawFeed from '@/components/law-feed';
import MainContent from '@/app/main-content';
import { Lawbot } from '@/components/lawbot';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 grid md:grid-cols-[1fr_minmax(350px,400px)] gap-6 lg:gap-8 p-4 lg:p-6">
        <div className="flex flex-col gap-6 lg:gap-8 min-w-0">
          <MainContent />
        </div>
        <aside className="hidden md:flex flex-col gap-6 lg:gap-8">
          <LawFeed />
          <Lawbot />
        </aside>
      </main>
    </div>
  );
}
