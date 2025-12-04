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

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const askLawbot = async (query: string, history: Message[]): Promise<AsyncIterable<string>> => {
  if (!query) {
    async function* emptyGenerator() {
      yield "Please provide a query.";
    }
    return emptyGenerator();
  }

  try {
    const resultStream = await answerLegalQuery({ query, history });
    return resultStream;
  } catch (error: any) {
    console.error('Error in askLawbot action:', error);
    async function* errorGenerator() {
      if (error.message.includes('overloaded')) {
          yield "The AI service is currently experiencing high traffic. Please try again in a few moments.";
      } else if (error.message.includes('blocked')) {
          yield "Your query could not be processed due to the content policy. Please try rephrasing your question.";
      } else {
          yield "I'm sorry, I encountered an issue and can't respond right now. Please try again later.";
      }
    }
    return errorGenerator();
  }
};
