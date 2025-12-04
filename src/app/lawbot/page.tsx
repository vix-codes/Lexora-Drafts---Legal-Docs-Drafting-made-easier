
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import Header from '@/components/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { askLawbot } from '@/app/actions';

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
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { id: Date.now(), sender: 'user', text: input };
    const currentInput = input;
    const currentHistory = messages.map(m => ({ role: m.sender, parts: [{ text: m.text }] }));
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsPending(true);

    const botMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: botMessageId, sender: 'bot', text: '' }]);
    
    try {
        const stream = await askLawbot(currentInput, currentHistory.slice(0, -1)); // Pass history without the new user message
        
        for await (const chunk of stream) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === botMessageId
                        ? { ...msg, text: msg.text + chunk }
                        : msg
                )
            );
        }
    } catch (error) {
        console.error('Streaming error:', error);
        setMessages(prev =>
            prev.map(msg =>
                msg.id === botMessageId
                    ? { ...msg, text: "Sorry, I couldn't process that. Please try again." }
                    : msg
            )
        );
    } finally {
        setIsPending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              Lawbot
            </CardTitle>
            <CardDescription>Your AI-powered legal assistant.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    {message.sender === 'bot' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                       {isPending && message.id === messages[messages.length - 1].id && (
                         <Loader2 className="h-4 w-4 animate-spin inline-block ml-2" />
                       )}
                    </div>
                    {message.sender === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><User size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isPending && handleSend()}
                placeholder="Ask a legal question..."
                disabled={isPending}
              />
              <Button onClick={handleSend} disabled={isPending || !input.trim()}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
