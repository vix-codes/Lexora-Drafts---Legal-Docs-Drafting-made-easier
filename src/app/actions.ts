'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (prevState: DraftState, formData: FormData): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());

  try {
    // 1. Generate the legal draft using the AI flow
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData,
    });
    
    const draftContent = result.legalDraft;

    // 2. Return the generated draft to the client
    return { draft: draftContent };
  } catch (error: any) {
    console.error('Error generating draft:', error);
    // Distinguish between AI errors and other errors if possible
    if (error.message.includes('overloaded')) {
        return { error: 'The AI service is currently busy. Please try again in a moment.' };
    }
    return { error: 'Failed to generate draft. Please try again.' };
  }
};
