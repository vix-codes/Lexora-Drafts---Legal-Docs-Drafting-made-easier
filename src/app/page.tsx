'use client';

import Header from '@/components/header';
import LegalPrecedents from '@/components/legal-precedents';
import HomeContent from '@/app/home-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, History, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth-provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, getFirestore, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

type Activity = {
  id: string;
  action: string;
  subject: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  }
};

function RecentActivity() {
  const { user } = useAuth();
  
  const activitiesQuery = useMemo(() => {
    if (!user) return null;
    const db = getFirestore(app);
    return query(
      collection(db, 'users', user.uid, 'activities'), 
      orderBy('timestamp', 'desc'), 
      limit(5)
    );
  }, [user]);

  // @ts-ignore
  const { data: activities, isLoading } = useCollection<Activity>(activitiesQuery);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      );
    }
    
    if (!activities || activities.length === 0) {
      return <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>;
    }
    
    return (
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{activity.action}</span>
              <span className="text-muted-foreground"> {activity.subject}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp.seconds * 1000), { addSuffix: true }) : 'Just now'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>A log of your recent actions within the app.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}

function GlossaryPreview() {
  const terms = [
    { term: 'Affidavit', definition: 'A written statement confirmed by oath or affirmation...' },
    { term: 'Arbitration', definition: 'A form of alternative dispute resolution (ADR)...' },
    { term: 'Indemnity', definition: 'Security or protection against a loss or financial burden...' },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          Legal Glossary
        </CardTitle>
        <CardDescription>Quick definitions for common legal terms.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {terms.map((item, index) => (
          <div key={item.term}>
            <h3 className="font-semibold text-sm text-primary">{item.term}</h3>
            <p className="text-sm text-muted-foreground">{item.definition}</p>
            {index < terms.length - 1 && <Separator className="mt-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <HomeContent>
        <LegalPrecedents />
      </HomeContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 p-4 lg:p-6">
        <GlossaryPreview />
        <RecentActivity />
      </div>
    </div>
  );
}
