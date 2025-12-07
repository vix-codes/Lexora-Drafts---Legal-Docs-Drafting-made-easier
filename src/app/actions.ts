
'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';

import { documentTemplates } from '@/lib/data';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore as getClientFirestore, collection, addDoc, serverTimestamp as clientServerTimestamp } from 'firebase/firestore';

import { firebaseConfig } from '@/firebase/config';


/* -----------------------------------------
   Initialize Client Firebase App (Next.js)
------------------------------------------*/

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_-_-  GENERATE DRAFT   -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

type DraftState = {
  draft?: string;
  error?: string;
};

export const generateDraft = async (
  prevState: DraftState,
  formData: FormData
): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const rawData = Object.fromEntries(formData.entries());
  const userId = formData.get('userId') as string;

  try {
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData
    });

    const draftContent = result.legalDraft;

    // Activity logging (non-blocking)
    if (userId) {
      try {
        const app = getFirebaseApp();
        const db = getClientFirestore(app);
        const activitiesRef = collection(db, 'users', userId, 'activities');

        const docLabel =
          documentTemplates.find(t => t.value === docType)?.label ?? 'document';

        await addDoc(activitiesRef, {
          action: 'Generated',
          subject: docLabel,
          timestamp: clientServerTimestamp(),
          userId
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }
    }

    return { draft: draftContent };
  } catch (error: any) {
    console.error('Error generating draft:', error);

    if (error.message.includes('overloaded')) {
      return { error: 'AI is busy. Try again shortly.' };
    }

    return { error: 'Could not generate draft. Try again.' };
  }
};

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_  LAW BOT QUERY   -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const askLawbot = async (
  query: string,
  history: Message[]
): Promise<LegalQueryOutput> => {
  if (!query) return { answer: 'Please provide a query.' };

  try {
    const result = await answerLegalQuery({ query, history });
    return result;
  } catch (error: any) {
    console.error('LawBot Error:', error);

    let msg = "I'm having trouble answering. Try again soon.";

    if (error.message.includes('overloaded')) {
      msg = 'AI is overloaded. Try again shortly.';
    } else if (error.message.includes('blocked')) {
      msg = 'Your query violates content policy. Rephrase it.';
    }

    return { answer: msg };
  }
};

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_-_  REQUEST VERIFICATION   -_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

export async function requestVerification(
  userId: string,
  documentType: string,
  draftContent: string,
  formInputs: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !draftContent) {
    return { success: false, error: 'User ID and draft content are required.' };
  }

  try {
    const app = getFirebaseApp();
    const db = getClientFirestore(app);
    const requestsRef = collection(db, 'verificationRequests');

    const requestData = {
      userId,
      documentType,
      draftContent,
      formInputs,
      status: 'pending',
      lawyerComments: [],
      lawyerNotification: '',
      createdAt: clientServerTimestamp(),
      updatedAt: clientServerTimestamp(),
      type: 'document' as const // Distinguish from lawyer verification
    };

    await addDoc(requestsRef, requestData);
    return { success: true };
  } catch (error) {
    console.error('SERVER VERIFICATION ERROR:', error);
    // Instead of throwing, return a structured error response
    return { success: false, error: 'Failed to save verification request on server.' };
  }
}

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_  REQUEST LAWYER VERIFICATION   -_-_-_-_-_-_-_-_-_-_-_-*/

export async function requestLawyerVerification(
  userId: string,
  profileData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
        return { success: false, error: 'User ID is required.' };
    }

    try {
        const app = getFirebaseApp();
        const db = getClientFirestore(app);
        const requestsRef = collection(db, 'verificationRequests');

        // Create a document that contains all the profile info for the admin to review
        const requestData = {
            userId,
            documentType: 'Lawyer Profile', // Specific type for this request
            draftContent: `Verification request for ${profileData.name}.
Email: ${profileData.email}
Phone: ${profileData.phone}
Location: ${profileData.location.city}, ${profileData.location.state}
Specializations: ${profileData.specializations.join(', ')}
Experience: ${profileData.experience} years
Bio: ${profileData.description}`,
            formInputs: profileData, // Store the raw form data
            status: 'pending',
            lawyerComments: [],
            lawyerNotification: '',
            createdAt: clientServerTimestamp(),
            updatedAt: clientServerTimestamp(),
            type: 'lawyer' as const // Distinguish from document verification
        };

        await addDoc(requestsRef, requestData);

        return { success: true };
    } catch (error) {
        console.error('LAWYER VERIFICATION SUBMISSION ERROR:', error);
        return { success: false, error: 'Failed to submit lawyer profile for verification.' };
    }
}
