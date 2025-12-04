'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { documentTemplates } from '@/lib/data';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

// Correctly initialize Firebase app for server-side usage
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}


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
        const app = getFirebaseApp();
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

export async function requestVerification(
  userId: string,
  documentType: string,
  draftContent: string,
  formInputs: Record<string, any>
) {
  if (!userId || !draftContent) {
    return { success: false, message: 'User ID and draft content are required to send a request.' };
  }

  try {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    const requestsRef = collection(db, 'verificationRequests');

    await addDoc(requestsRef, {
      userId,
      documentType,
      draftContent,
      formInputs,
      status: 'pending',
      lawyerComments: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, message: 'Your request has been sent to the lawyer.' };
  } catch (error) {
    console.error('Error creating verification request:', error);
    return { success: false, message: 'Failed to send verification request.' };
  }
}

export async function addLawyerComment(requestId: string, commentText: string) {
  if (!requestId || !commentText) {
    throw new Error('Request ID and comment are required.');
  }
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const requestRef = doc(db, 'verificationRequests', requestId);

  try {
    const newComment = {
      text: commentText,
      timestamp: new Date(), // Using client-side date for simplicity, serverTimestamp is better
    };

    await updateDoc(requestRef, {
      status: 'reviewed',
      lawyerComments: arrayUnion(newComment),
      updatedAt: serverTimestamp(),
      lawyerNotification: 'Your draft has been reviewed. Please see lawyer comments.',
    });
    return { success: true, message: 'Comment added and user notified.' };
  } catch (error) {
    console.error('Error adding lawyer comment:', error);
    return { success: false, message: 'Failed to add comment.' };
  }
}

export async function approveRequest(requestId: string) {
  if (!requestId) {
    throw new Error('Request ID is required.');
  }
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const requestRef = doc(db, 'verificationRequests', requestId);

  try {
    await updateDoc(requestRef, {
      status: 'approved',
      updatedAt: serverTimestamp(),
      lawyerNotification: 'Your draft has been approved.',
    });
    return { success: true, message: 'Draft approved and user notified.' };
  } catch (error) {
    console.error('Error approving request:', error);
    return { success: false, message: 'Failed to approve request.' };
  }
}
