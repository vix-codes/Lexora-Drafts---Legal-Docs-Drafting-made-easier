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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" viewportRef={viewportRef}>
          <div className="space-y-4 py-4">
            {messages.map((message, index) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'bot' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback><Bot size={20} /></AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={cn(
                    "rounded-lg px-4 py-2 max-w-[80%]",
                    message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                    isPending && message.sender === 'user' && index === messages.length - 1 && 'animate-pulse'
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
          </div>
        </ScrollArea>
        <div className="py-4">
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
        </div>
      </div>
    </div>
  );
}
