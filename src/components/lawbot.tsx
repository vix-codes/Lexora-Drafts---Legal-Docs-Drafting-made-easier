'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

const CHATBOT_URL = 'https://intelgpt.vercel.app/';

export function Lawbot() {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Ask Query to Lawbot
        </CardTitle>
        <CardDescription>Get instant answers to your legal questions from our AI assistant.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <iframe
          src={CHATBOT_URL}
          className="w-full h-[300px] border-0"
          title="Lawbot"
          allow="microphone"
        />
      </CardContent>
    </Card>
  );
}
