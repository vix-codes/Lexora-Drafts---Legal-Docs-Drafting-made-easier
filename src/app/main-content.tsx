'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { documentTemplates, type DocumentTemplate, type TemplateField } from '@/lib/data';
import { generateDraftAction } from '@/app/actions';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentPreview } from '@/components/document-preview';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Generate Draft
    </Button>
  );
}

export default function MainContent() {
  const { toast } = useToast();
  const [formKey, setFormKey] = useState(Date.now());
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [initialState, setInitialState] = useState<{ draft?: string; error?: string }>({});

  const [state, formAction] = useFormState(generateDraftAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleTemplateChange = (value: string) => {
    const template = documentTemplates.find(t => t.value === value) || null;
    setSelectedTemplate(template);
    handleReset();
  };

  const handleReset = () => {
    setFormKey(Date.now());
    setInitialState({ draft: undefined, error: undefined });
  };
  
  const { pending } = useFormStatus();

  const selectedTemplateLabel = useMemo(() => {
    return selectedTemplate?.label ?? "Document";
  }, [selectedTemplate]);

  return (
    <>
      <form key={formKey} action={formAction}>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Draft Generator
            </CardTitle>
            <CardDescription>Select a document type and fill in the details to generate your draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select name="documentType" required onValueChange={handleTemplateChange}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Choose a legal document..." />
                </SelectTrigger>
                <SelectContent>
                  {documentTemplates.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50">
                {selectedTemplate.fields.map((field: TemplateField) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        required
                        className="col-span-full"
                      />
                    ) : (
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        required
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" type="button" onClick={handleReset} disabled={pending}>
              Reset
            </Button>
            <SubmitButton />
          </CardFooter>
        </Card>
      </form>
      <DocumentPreview draft={state?.draft} isLoading={pending} documentTypeLabel={selectedTemplateLabel} />
    </>
  );
}
