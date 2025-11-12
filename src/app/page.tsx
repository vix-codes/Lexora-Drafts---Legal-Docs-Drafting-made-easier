import Header from '@/components/header';
import LegalPrecedents from '@/components/legal-precedents';
import HomeContent from '@/app/home-content';

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <HomeContent>
        <LegalPrecedents />
      </HomeContent>
    </div>
  );
}
