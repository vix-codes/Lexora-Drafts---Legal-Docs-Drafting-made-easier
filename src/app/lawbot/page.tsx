'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import Header from '@/components/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askLawbot } from '@/app/actions';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export default function LawbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'bot', text: "Hello! I am Lawbot, your AI legal assistant. How can I help you today? Please note, I am not a real lawyer and this is not legal advice." }
  ]);
  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
        viewportRef.current.scrollTo({
            top: viewportRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    const currentInput = input;
    const currentHistory = messages.map(m => ({ sender: m.sender, text: m.text }));
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsPending(true);

    try {
        const result = await askLawbot(currentInput, currentHistory);
        const botMessage: Message = { id: Date.now() + 1, sender: 'bot', text: result.answer };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        console.error('Error fetching bot response:', error);
        const errorMessage: Message = { id: Date.now() + 1, sender: 'bot', text: "Sorry, I couldn't process that. Please try again." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface-muted text-foreground">
      <Header />
      <main className="flex-1 p-4 lg:p-6 flex justify-center items-start">
        <Card className="w-full max-w-4xl h-full flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Ask Lawbot
            </CardTitle>
            <CardDescription>
              Get instant answers to your legal questions from our AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
            <ScrollArea className="flex-1 px-6 bg-surface" viewportRef={viewportRef}>
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'bot' && (
                      <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-surface-muted',
                        isPending && index === messages.length - (messages.some(m => m.sender === 'bot' && m.text.includes('Sorry')) ? 2 : 1) && message.sender === 'user' && 'animate-pulse'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><User size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isPending && (
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                      <AvatarFallback><Bot size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-surface-muted flex items-center space-x-2">
                        <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-foreground rounded-full animate-pulse"></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-6 pt-4 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && !isPending && handleSend()}
                  placeholder="Ask a legal question..."
                  disabled={isPending}
                  className="bg-background"
                />
                <Button onClick={handleSend} disabled={isPending || !input.trim()}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
