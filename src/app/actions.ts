'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { serverTimestamp } from 'firebase/firestore';


type DraftState = {
  draft?: string;
  error?: string;
};

// Re-usable function to get the admin app instance.
function getAdminApp() {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined;

    if (!serviceAccount) {
        console.error('Firebase Admin SDK service account key is not available in environment variables.');
        return null;
    }

    if (getApps().some(app => app.name === 'admin-sdk')) {
        return getApps().find(app => app.name === 'admin-sdk')!;
    }
    
    return initializeApp({
        credential: cert(serviceAccount),
    }, 'admin-sdk');
}

export const generateAndSaveDraft = async (prevState: DraftState, formData: FormData): Promise<DraftState> => {
  const docType = formData.get('documentType') as string;
  const userId = formData.get('userId') as string;
  const rawData = Object.fromEntries(formData.entries());

  if (!userId) {
    return { error: 'User not authenticated. Please log in.' };
  }

  const adminApp = getAdminApp();
  if (!adminApp) {
    return { error: 'Server configuration error. Could not save draft. Please ensure your service account key is set up correctly.' };
  }

  try {
    // 1. Generate the legal draft using the AI flow
    const result = await generateLegalDraft({
      documentType: docType,
      formData: rawData,
    });
    
    const draftContent = result.legalDraft;

    // 2. Save the generated draft to Firestore using the Admin SDK
    const db = getAdminFirestore(adminApp);
    const draftsCollectionRef = db.collection('users').doc(userId).collection('drafts');
    
    await draftsCollectionRef.add({
      userId: userId,
      documentType: docType,
      content: draftContent,
      createdAt: getAdminFirestore.FieldValue.serverTimestamp(),
    });

    // 3. Return the generated draft to the client
    return { draft: draftContent };
  } catch (error: any) {
    console.error('Error generating or saving draft:', error);
    // Distinguish between AI errors and other errors if possible
    if (error.message.includes('overloaded')) {
        return { error: 'The AI service is currently busy. Please try again in a moment.' };
    }
    return { error: 'Failed to generate or save draft. Please try again.' };
  }
};
