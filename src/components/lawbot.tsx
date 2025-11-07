'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, MessageSquare, Bot } from 'lucide-react';
import { Input } from './ui/input';

const CHATBOT_URL = 'https://intelgpt.vercel.app/';

export function Lawbot() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={toggleChat} size="icon" className="rounded-full h-14 w-14 shadow-lg">
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          <span className="sr-only">Toggle Lawbot</span>
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50">
          <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Lawbot
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {CHATBOT_URL === 'YOUR_VERCEL_APP_URL_HERE' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4">
                   <div className="flex flex-col items-center justify-center h-full text-center p-4">
                     <p className="text-muted-foreground">
                       Please replace the placeholder URL in{' '}
                       <code className="bg-muted px-1 py-0.5 rounded-sm">src/components/lawbot.tsx</code> to enable the chatbot.
                     </p>
                   </div>
                </div>
              ) : (
                <iframe
                  src={CHATBOT_URL}
                  className="w-full h-full border-0"
                  title="Lawbot"
                  allow="microphone"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
