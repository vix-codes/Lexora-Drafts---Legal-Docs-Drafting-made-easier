import Header from '@/components/header';
import LegalPrecedents from '@/components/legal-precedents';
import HomeContent from '@/app/home-content';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function RecentActivity() {
  const activities = [
    {
      action: 'Generated',
      subject: 'Rental Agreement',
      time: '15 mins ago',
    },
    {
      action: 'Searched for',
      subject: '"intellectual property"',
      time: '1 hour ago',
    },
    {
      action: 'Viewed',
      subject: 'Partnership Deed Template',
      time: '3 hours ago',
    },
  ];

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
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{activity.action}</span>
                <span className="text-muted-foreground"> {activity.subject}</span>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
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
