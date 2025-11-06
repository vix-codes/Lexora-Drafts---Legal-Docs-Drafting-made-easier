'use client';

import { useState, type ReactNode } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from './ui/input';
import { glossaryTerms } from '@/lib/data';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { BookText, Search } from 'lucide-react';

export function Glossary({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader className="pr-6">
          <SheetTitle className="flex items-center gap-2 font-headline">
            <BookText className="h-5 w-5" />
            Legal Glossary
          </SheetTitle>
          <SheetDescription>
            Search for definitions of common legal terms.
          </SheetDescription>
        </SheetHeader>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="flex-1 pr-6 mt-4">
          <div className="flex flex-col gap-4">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((item, index) => (
                <div key={item.term}>
                  <h3 className="font-semibold text-primary">{item.term}</h3>
                  <p className="text-sm text-muted-foreground">{item.definition}</p>
                  {index < filteredTerms.length - 1 && <Separator className="mt-4" />}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No terms found.</p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
