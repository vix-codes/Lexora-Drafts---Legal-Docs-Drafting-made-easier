'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Bot, Search } from 'lucide-react';

const CHATBOT_URL = 'https://intelgpt.vercel.app/';

export function Lawbot() {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find a Lawyer
          </CardTitle>
          <CardDescription>Search for legal professionals in your area.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex w-full items-center space-x-2">
            <Input type="text" placeholder="Enter your city or pincode..." />
            <Button type="submit" variant="outline" size="icon">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
