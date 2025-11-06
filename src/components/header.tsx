import { BookText, Scale } from 'lucide-react';
import { Logo } from './icons';
import { Glossary } from './glossary';
import { Button } from './ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        <Logo className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-xl font-semibold tracking-tight">lawIntel</h1>
      </div>
      <div className="flex items-center gap-2">
        <Glossary>
          <Button variant="ghost" size="icon">
            <BookText className="h-5 w-5" />
            <span className="sr-only">Open Glossary</span>
          </Button>
        </Glossary>
      </div>
    </header>
  );
}
