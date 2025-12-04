'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery } from '@/ai/flows/answer-legal-query';

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (prevState: DraftState, formData: FormData): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());

  try {
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData,
    });
    
    const draftContent = result.legalDraft;

    return { draft: draftContent };
  } catch (error: any) {
    console.error('Error generating draft:', error);
    if (error.message.includes('overloaded')) {
        return { error: 'The AI service is currently busy. Please try again in a moment.' };
    }
    return { error: 'Failed to generate draft. Please try again.' };
  }
};


export const askLawbot = async (query: string): Promise<string> => {
  if (!query) {
    return "Please provide a query.";
  }

  try {
    const result = await answerLegalQuery({ query });
    return result.answer;
  } catch (error) {
    console.error('Error in askLawbot action:', error);
    return "I'm sorry, I encountered an issue and can't respond right now. Please try again later.";
  }
};
