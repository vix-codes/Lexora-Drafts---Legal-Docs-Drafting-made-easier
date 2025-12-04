
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { lawyers } from '@/lib/data';
import { Search } from 'lucide-react';
import Header from '@/components/header';

export default function FindLawyerPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLawyers = lawyers.filter(lawyer =>
    lawyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.expertise.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lawyer.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              Find a Legal Professional
            </CardTitle>
            <CardDescription>Search for lawyers by name, expertise, or location.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for a lawyer..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLawyers.map((lawyer, index) => (
                <Card key={index}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={`https://picsum.photos/seed/${index + 10}/200`} data-ai-hint="person professional" />
                      <AvatarFallback>{lawyer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{lawyer.name}</h3>
                    <p className="text-primary">{lawyer.expertise}</p>
                    <p className="text-muted-foreground text-sm">{lawyer.location}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
