
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const CHATBOT_URL = '/lawbot';

export function Lawbot() {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Ask Lawbot
        </CardTitle>
        <CardDescription>Get instant answers to your legal questions from our AI assistant.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href={CHATBOT_URL}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Start Chat
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
