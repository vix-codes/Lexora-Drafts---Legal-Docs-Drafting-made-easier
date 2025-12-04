
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, FileText, Search, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HomeContent from './home-content';
import { useAuth } from '@/components/auth-provider';

const features = [
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'Ask Lawbot',
    description: 'Get instant, AI-powered answers to your legal questions based on Indian law.',
    link: '/lawbot',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Draft Legal Documents',
    description: 'Generate formatted legal drafts like rental agreements and NDAs in minutes.',
    link: '/draft',
  },
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: 'Find a Lawyer',
    description: 'Search our network of verified legal professionals across India by location.',
    link: '/find-lawyer',
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Legal Glossary',
    description: 'Understand complex legal jargon with a searchable library of simple definitions.',
    link: '/', // The glossary is in a sheet, can be opened from header in other pages
  },
];


function PublicLandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-20 lg:py-32 px-4">
        <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">
          Legal Intelligence, <span className="text-primary">Simplified.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Lexintel makes Indian law easier to access. From quick legal explanations to ready-to-use drafts and lawyer discovery, everything is available in one platform.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Create Account</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-24 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Try It Now</h2>
            <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
              Instant access. No login required.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Link href={feature.link} key={feature.title} className="block group">
                <Card className="h-full hover:border-primary transition-colors hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 lg:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold">About Lexintel</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our mission is to demystify the legal landscape in India. We believe that access to legal tools and knowledge should be straightforward and accessible to everyone. By leveraging cutting-edge AI, we provide solutions that save time, reduce complexity, and empower our users—whether you are a business professional, a law student, or an individual seeking legal clarity.
          </p>
        </div>
      </section>
    </>
  );
}


export default function Page() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {user ? <HomeContent /> : <PublicLandingPage />}
      </main>
      <Footer />
    </div>
  );
}
