'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/firebase/client';
import { documentTemplates } from '@/lib/data';

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (prevState: DraftState, formData: FormData): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());
  const userId = formData.get('userId') as string;

  try {
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData,
    });
    
    const draftContent = result.legalDraft;

    // Log activity to Firestore
    if (userId) {
      try {
        const db = getFirestore(app);
        const activitiesRef = collection(db, 'users', userId, 'activities');
        const docLabel = documentTemplates.find(t => t.value === docType)?.label ?? 'document';
        
        await addDoc(activitiesRef, {
          action: 'Generated',
          subject: docLabel,
          timestamp: serverTimestamp(),
          userId: userId,
        });
      } catch (dbError) {
        console.error('Failed to log activity:', dbError);
        // We don't block the user flow if logging fails
      }
    }


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

export const askLawbot = async (query: string, history: Message[]): Promise<LegalQueryOutput> => {
  if (!query) {
    return { answer: "Please provide a query." };
  }

  try {
    const result = await answerLegalQuery({ query, history });
    return result;
  } catch (error: any) {
    console.error('Error in askLawbot action:', error);
    let errorMessage = "I'm sorry, I encountered an issue and can't respond right now. Please try again later.";
    
    if (error.message) {
      if (error.message.includes('overloaded')) {
          errorMessage = "The AI service is currently experiencing high traffic. Please try again in a few moments.";
      } else if (error.message.includes('blocked')) {
          errorMessage = "Your query could not be processed due to the content policy. Please try rephrasing your question.";
      }
    }
    
    return { answer: errorMessage };
  }
};
