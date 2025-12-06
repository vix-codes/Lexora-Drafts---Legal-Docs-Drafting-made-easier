
'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';

import { documentTemplates } from '@/lib/data';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

import { createServerClient } from '@/firebase/server-client';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

/* -----------------------------------------
   Initialize Client Firebase App (Next.js)
------------------------------------------*/

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

/* -----------------------------------------
   GENERATE DRAFT
------------------------------------------*/

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
        const db = getFirestore(app);
        const activitiesRef = collection(db, 'users', userId, 'activities');

        const docLabel =
          documentTemplates.find(t => t.value === docType)?.label ?? 'document';

        await addDoc(activitiesRef, {
          action: 'Generated',
          subject: docLabel,
          timestamp: serverTimestamp(),
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

/* -----------------------------------------
   LAW BOT QUERY
------------------------------------------*/

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

/* -----------------------------------------
   REQUEST DRAFT VERIFICATION
------------------------------------------*/

export async function requestVerification(
  userId: string,
  documentType: string,
  draftContent: string,
  formInputs: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  if (!userId || !draftContent) {
    throw new Error('User ID and draft content are required.');
  }

  try {
    const app = getFirebaseApp();
    const db = getFirestore(app);

    const requestsRef = collection(db, 'verificationRequests');

    const requestData = {
      userId,
      documentType,
      draftContent,
      formInputs,
      status: 'pending',
      lawyerComments: [],
      lawyerNotification: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: 'document' // Distinguish from lawyer verification
    };

    await addDoc(requestsRef, requestData);

    return { success: true };
  } catch (error) {
    console.error('SERVER VERIFICATION ERROR:', error);
    throw new Error('Failed to save verification request on server.');
  }
}

/* -----------------------------------------
   REQUEST LAWYER VERIFICATION
------------------------------------------*/
export async function requestLawyerVerification(
  userId: string,
  profileData: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
        throw new Error('User ID is required.');
    }

    try {
        const app = getFirebaseApp();
        const db = getFirestore(app);
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

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            type: 'lawyer' // Distinguish from document verification
        };

        await addDoc(requestsRef, requestData);

        return { success: true };
    } catch (error) {
        console.error('LAWYER VERIFICATION SUBMISSION ERROR:', error);
        throw new Error('Failed to submit lawyer profile for verification.');
    }
}


/* -----------------------------------------
   LAWYER ACTIONS (Comments, Approvals)
------------------------------------------*/

export async function addLawyerComment(
  requestId: string,
  commentText: string
): Promise<void> {
  if (!requestId || !commentText) {
    throw new Error('Request ID and comment are required.');
  }

  const app = getFirebaseApp();
  const db = getFirestore(app);
  const requestRef = doc(db, 'verificationRequests', requestId);

  const newComment = {
    text: commentText,
    timestamp: new Date()
  };

  const updateData = {
    status: 'reviewed',
    lawyerComments: arrayUnion(newComment),
    updatedAt: serverTimestamp(),
    lawyerNotification: 'Your draft has been reviewed.'
  };

  updateDoc(requestRef, updateData).catch(err => {
    const permissionError = new FirestorePermissionError({
      path: requestRef.path,
      operation: 'update',
      requestResourceData: updateData
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

export async function approveRequest(requestId: string, requestData?: any): Promise<void> {
  if (!requestId) throw new Error('Request ID required.');

  const app = getFirebaseApp();
  const db = getFirestore(app);
  const requestRef = doc(db, 'verificationRequests', requestId);

  // If it's a lawyer verification, create the lawyer profile
  if (requestData?.type === 'lawyer' && requestData.userId && requestData.formInputs) {
      const lawyerRef = doc(db, 'lawyers', requestData.userId);
      const profileData = requestData.formInputs;
      
      const newLawyerData = {
        id: requestData.userId,
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        specializations: profileData.specializations,
        experience: profileData.experience,
        description: profileData.description,
        isVerified: true,
        rating: 4.0 + Math.random(), // Assign a default rating
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        source: 'internal'
      };

      // Use setDoc to create the new lawyer document
      await setDoc(lawyerRef, newLawyerData);
  }

  const updateData = {
    status: 'approved',
    updatedAt: serverTimestamp(),
    lawyerNotification: `Your ${requestData?.type ?? 'draft'} has been approved.`
  };

  updateDoc(requestRef, updateData).catch(err => {
    const permissionError = new FirestorePermissionError({
      path: requestRef.path,
      operation: 'update',
      requestResourceData: updateData
    });
    errorEmitter.emit('permission-error', permissionError);
  });
}

/* -----------------------------------------
   GET USER REQUESTS (ADMIN SDK)
------------------------------------------*/

export async function getUserRequests(
  userId: string
): Promise<any[]> {
  if (!userId) return [];

  try {
    const adminApp = createServerClient();
    if (!adminApp) throw new Error('Service account client not found.');

    const db = getAdminFirestore(adminApp);

    // Admin SDK uses db.collection()
    const requestsRef = db.collection('verificationRequests');

    const q = requestsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    const snapshot = await q.get();

    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt?.toDate
          ? data.updatedAt.toDate().toISOString()
          : null,
        lawyerComments:
          data.lawyerComments?.map((c: any) => ({
            ...c,
            timestamp: c.timestamp?.toDate
              ? c.timestamp.toDate().toISOString()
              : null
          })) ?? []
      };
    });
  } catch (err) {
    console.error('Error fetching user requests:', err);
    return [];
  }
}
