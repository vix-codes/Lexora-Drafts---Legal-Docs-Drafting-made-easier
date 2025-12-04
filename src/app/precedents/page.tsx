import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { legalPrecedents } from '@/lib/data';
import { BookMarked } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function LegalPrecedentsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-primary" />
              Key Legal Precedents
            </CardTitle>
            <CardDescription>Explore landmark cases from Indian judicial history and their lasting impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {legalPrecedents.map((precedent, index) => (
              <div key={precedent.caseName}>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-primary">{precedent.caseName} ({precedent.year})</h3>
                  <p className="text-sm text-muted-foreground font-mono">{precedent.citation}</p>
                  <p className="text-muted-foreground">{precedent.summary}</p>
                  <p><span className="font-semibold">Impact:</span> {precedent.impact}</p>
                </div>
                {index < legalPrecedents.length - 1 && <Separator className="my-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
