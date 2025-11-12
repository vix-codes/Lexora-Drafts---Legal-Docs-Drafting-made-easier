
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare } from 'lucide-react';

const CHATBOT_BASE_URL = 'https://intelgpt.vercel.app/';

export function Lawbot() {
  const openLawbot = () => {
    window.open(CHATBOT_BASE_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Ask Query to Lawbot
        </CardTitle>
        <CardDescription>Get instant answers to your legal questions from our AI assistant.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={openLawbot} className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          Start Chat
        </Button>
      </CardContent>
    </Card>
  );
}
