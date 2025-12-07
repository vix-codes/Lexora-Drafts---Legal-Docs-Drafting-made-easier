
'use server';

import { createServerClient } from '@/firebase/server-client';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import type { App } from 'firebase-admin/app';

const PREVIEW_ENV_ERROR = 'This feature is not available in the preview environment. Please deploy your application to use this function.';

// Initialize Admin SDK once at the module level.
let adminApp: App | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;
let initializationError: string | null = null;

try {
  adminApp = createServerClient();
  if (adminApp) {
    adminDb = getAdminFirestore(adminApp);
  } else {
    // This case handles when createServerClient returns null (e.g., missing env vars)
    initializationError = PREVIEW_ENV_ERROR;
  }
} catch (e: any) {
    // This case handles any unexpected exception during initialization.
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK in admin-actions.ts", e);
    initializationError = e.message || 'Failed to initialize server functionality.';
}


/**
 * A higher-order function that wraps an admin action.
 * It checks for the Admin SDK initialization status before executing the action.
 * If the SDK is not available, it returns a consistent error object, preventing crashes.
 *
 * @param fn The admin action function to wrap.
 * @returns An async function that is safe to call from components.
 */
function withAdmin<T extends (...args: any[]) => Promise<any>>(
  fn: (db: ReturnType<typeof getAdminFirestore>, ...args: Parameters<T>) => ReturnType<T>
) {
  return async function(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    // This guard is the most important part. It runs on every call.
    if (initializationError || !adminDb) {
      console.warn(`Admin action blocked: ${initializationError}`);
      // This is a generic way to return an error that should work for most of our actions.
      // It assumes actions return an object with `success` and `error` or an array.
      // You might need to adjust this if your actions have different return types.
      return { success: false, error: initializationError } as Awaited<ReturnType<T>>;
    }
    // If the check passes, execute the original function with the db instance.
    return fn(adminDb, ...args);
  };
}


// --- EXPORTED ADMIN ACTIONS ---
// Each action is now wrapped with the `withAdmin` guard.

export const addLawyerComment = withAdmin(async (
  db,
  requestId: string,
  commentText: string
): Promise<{ success: boolean; error?: string }> => {
  if (!requestId || !commentText) {
    return { success: false, error: 'Request ID and comment are required.' };
  }

  try {
    const requestRef = db.collection('verificationRequests').doc(requestId);
    const newComment = {
      text: commentText,
      timestamp: FieldValue.serverTimestamp()
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
});


interface ApproveRequestData {
  userId: string;
  type: 'document' | 'lawyer';
  documentType: string;
  draftContent: string;
  formInputs: Record<string, any>;
}

export const approveRequest = withAdmin(async (
  db,
  requestId: string,
  requestData: ApproveRequestData
): Promise<{ success: boolean; error?: string }> => {
  if (!requestId || !requestData) {
    return { success: false, error: 'Request ID and data are required.' };
  }
  try {
    const requestRef = db.collection('verificationRequests').doc(requestId);
    if (requestData.type === 'lawyer' && requestData.userId && requestData.formInputs) {
      const lawyerRef = db.collection('lawyers').doc(requestData.userId);
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
    } else if (requestData.type === 'document' && requestData.userId) {
      const approvedDraftsRef = db.collection('users').doc(requestData.userId).collection('approvedDrafts');
      await approvedDraftsRef.add({
        originalRequestId: requestId,
        documentType: requestData.documentType,
        approvedContent: requestData.draftContent,
        approvedAt: FieldValue.serverTimestamp(),
      });
    }
    await requestRef.update({
      status: 'approved',
      updatedAt: FieldValue.serverTimestamp(),
      lawyerNotification: `Your ${requestData.type ?? 'draft'} has been approved.`
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error approving request:', error);
    return { success: false, error: error.message || 'Failed to approve request.' };
  }
});


export const getUserRequests = withAdmin(async(db, userId: string): Promise<any[]> => {
  if (!userId) return [];
  try {
    const requestsRef = db.collection('verificationRequests');
    const q = requestsRef.where('userId', '==', userId).orderBy('createdAt', 'desc');
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
});

export const getUserProfiles = withAdmin(async (db, userIds: string[]): Promise<Record<string, string>> => {
  if (!userIds || userIds.length === 0) {
    return {};
  }
  try {
    const usersRef = db.collection('users');
    const q = usersRef.where('__name__', 'in', userIds);
    const snapshot = await q.get();
    if (snapshot.empty) return {};
    const profiles: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      profiles[doc.id] = doc.data()?.username || 'Unknown User';
    });
    return profiles;
  } catch (err) {
    console.error('Error fetching user profiles:', err);
    return {};
  }
});

// A new safe wrapper that also handles array return types
function withAdminSafe<T extends (...args: any[]) => Promise<any>>(
  fn: (db: ReturnType<typeof getAdminFirestore>, ...args: Parameters<T>) => ReturnType<T>
) {
  return async function(...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    if (initializationError || !adminDb) {
      console.warn(`Admin action blocked: ${initializationError}`);
      
      // Attempt to infer return type. If it's likely an array, return []. Otherwise, return error object.
      // This is a heuristic and might need refinement. For now, we check the function name.
      const funcName = fn.name;
      if (funcName.toLowerCase().includes('get') && (funcName.toLowerCase().includes('requests') || funcName.toLowerCase().includes('profiles'))) {
         return [] as Awaited<ReturnType<T>>;
      }

      return { success: false, error: initializationError } as Awaited<ReturnType<T>>;
    }
    return fn(adminDb, ...args);
  };
}
