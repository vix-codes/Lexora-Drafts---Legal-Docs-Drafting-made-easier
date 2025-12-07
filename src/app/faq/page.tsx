
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      q: "Do I need a written agreement for validity in India?",
      a: "No. Oral agreements are valid, but written agreements are far safer because they serve as proof in disputes."
    },
    {
      q: "Is an e-signed contract legally valid?",
      a: "Yes. Aadhaar eSign, DSC, and platforms compliant with the IT Act make documents legally valid in India."
    },
    {
      q: "How do I check if a lawyer is officially registered?",
      a: "You can verify an advocate's Bar Council Enrollment Number through the respective State Bar Council or the BCI online portal."
    },
    {
      q: "Can WhatsApp messages be used as evidence?",
      a: "Yes. Chats, screenshots, and call logs can be used as electronic evidence if properly authenticated under the Evidence Act."
    },
    {
      q: "Is stamp paper mandatory for agreements?",
      a: "It is required for enforceability and to pay the proper stamp duty. Under-stamped agreements can still be valid but attract penalties."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1 p-4 lg:p-6">
            <Card className="max-w-4xl mx-auto bg-card border-border shadow-sm">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl flex items-center gap-3">
                        <HelpCircle className="h-8 w-8 text-primary" />
                        Legal FAQs
                    </CardTitle>
                    <CardDescription>
                        Short answers to India’s most common legal questions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map((item, i) => (
                    <div key={i} className="border-t border-border pt-4">
                        <h2 className="font-semibold text-lg text-foreground">{item.q}</h2>
                        <p className="text-muted-foreground mt-1">{item.a}</p>
                    </div>
                    ))}
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );
}
