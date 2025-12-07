
'use server';

import { generateLegalDraft } from '@/ai/flows/generate-legal-draft';
import { answerLegalQuery, type LegalQueryOutput } from '@/ai/flows/answer-legal-query';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp as clientServerTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { documentTemplates } from '@/lib/data';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';

import { createServerClient } from '@/firebase/server-client';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';

/* -----------------------------------------
   Initialize Client Firebase App (Next.js)
------------------------------------------*/

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_-_-_-  GENERATE DRAFT   -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

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

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
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


/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_-  LAWYER ACTIONS   -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

export async function addLawyerComment(
  requestId: string,
  commentText: string
): Promise<{ success: boolean; error?: string }> {
  if (!requestId || !commentText) {
    return { success: false, error: 'Request ID and comment are required.' };
  }

  try {
    const adminApp = createServerClient();
    if (!adminApp) throw new Error('Admin client initialization failed.');
    const adminDb = getAdminFirestore(adminApp);
    
    const requestRef = adminDb.collection('verificationRequests').doc(requestId);

    const newComment = {
      text: commentText,
      timestamp: new Date() // Admin SDK can use native Date which becomes a timestamp
    };

    await requestRef.update({
      status: 'reviewed',
      lawyerComments: FieldValue.arrayUnion(newComment),
      updatedAt: FieldValue.serverTimestamp(),
      lawyerNotification: 'Your draft has been reviewed.'
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error adding lawyer comment:', error);
    return { success: false, error: error.message || 'Failed to add comment.' };
  }
}

export async function approveRequest(requestId: string, requestData?: any): Promise<{ success: boolean; error?: string }> {
  if (!requestId) {
    return { success: false, error: 'Request ID is required.' };
  }

  try {
    const adminApp = createServerClient();
    if (!adminApp) throw new Error('Admin client initialization failed.');
    const adminDb = getAdminFirestore(adminApp);

    const requestRef = adminDb.collection('verificationRequests').doc(requestId);

    // Handle Lawyer Profile Approval
    if (requestData?.type === 'lawyer' && requestData.userId && requestData.formInputs) {
        const lawyerRef = adminDb.collection('lawyers').doc(requestData.userId);
        const profileData = requestData.formInputs;
        
        await lawyerRef.set({
          id: requestData.userId,
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          location: profileData.location,
          specializations: profileData.specializations,
          experience: profileData.experience,
          description: profileData.description,
          isVerified: true,
          rating: 4.0 + Math.random(),
          createdAt: FieldValue.serverTimestamp(),
          source: 'internal'
        }, { merge: true });
    
    // Handle Document Draft Approval
    } else if (requestData?.type === 'document' && requestData.userId) {
        const approvedDraftsRef = adminDb.collection('users').doc(requestData.userId).collection('approvedDrafts');
        
        await approvedDraftsRef.add({
            originalRequestId: requestId,
            documentType: requestData.documentType,
            approvedContent: requestData.draftContent,
            approvedAt: FieldValue.serverTimestamp(),
        });
    }
    
    // Finally, update the original request's status to 'approved'
    await requestRef.update({
      status: 'approved',
      updatedAt: FieldValue.serverTimestamp(),
      lawyerNotification: `Your ${requestData?.type ?? 'draft'} has been approved.`
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error approving request:', error);
    return { success: false, error: error.message || 'Failed to approve request.' };
  }
}

/* _-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-*/
/* _-_-_-_-_-_-_-_-_-_-_-_-_  GET USER DATA   -_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_*/

export async function getUserRequests(
  userId: string
): Promise<any[]> {
  if (!userId) return [];

  try {
    const adminApp = createServerClient();
    if (!adminApp) throw new Error('Service account client not found.');

    const db = getAdminFirestore(adminApp);
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        lawyerComments: data.lawyerComments?.map((c: any) => ({
            ...c,
            timestamp: c.timestamp?.toDate ? c.timestamp.toDate().toISOString() : new Date().toISOString(),
        })) ?? [],
      };
    });
  } catch (err) {
    console.error('Error fetching user requests:', err);
    return [];
  }
}

export async function getUserProfiles(userIds: string[]): Promise<Record<string, string>> {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  try {
    const adminApp = createServerClient();
    if (!adminApp) throw new Error('Service account client not found.');

    const db = getAdminFirestore(adminApp);
    const usersRef = db.collection('users');
    
    // Firestore 'in' query supports up to 30 items. If more are needed, batching would be required.
    const q = usersRef.where('__name__', 'in', userIds);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return {};
    }

    const profiles: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      // Assuming 'username' is the field to display. Default to a placeholder if not present.
      profiles[doc.id] = doc.data()?.username || 'Unknown User';
    });

    return profiles;

  } catch (err) {
    console.error('Error fetching user profiles:', err);
    return {};
  }
}
