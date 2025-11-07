'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';

const CHATBOT_BASE_URL = 'https://intelgpt.vercel.app/';
// By appending the `embed=true` and theme parameters, we ensure the Vercel app renders in embed mode.
const CHATBOT_URL_WITH_THEME = `${CHATBOT_BASE_URL}?embed=true&theme=dark&backgroundColor=hsl(241_30%_19%)&textColor=hsl(0_0%_98%)&primaryColor=hsl(242_100%_70%)&hideTitle=true&hideHeader=true`;


export function Lawbot() {
  return (
    <Card className="flex-1 flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Ask Query to Lawbot
        </CardTitle>
        <CardDescription>Get instant answers to your legal questions from our AI assistant.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <iframe
          src={CHATBOT_URL_WITH_THEME}
          className="w-full h-full min-h-[300px] border-0 rounded-b-lg"
          title="Lawbot"
          allow="microphone"
        />
      </CardContent>
    </Card>
  );
}
