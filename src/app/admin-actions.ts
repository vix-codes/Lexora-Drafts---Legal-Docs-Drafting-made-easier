
'use server';

import { createServerClient } from '@/firebase/server-client';
import { getFirestore as getAdminFirestore, FieldValue } from 'firebase-admin/firestore';
import type { App } from 'firebase-admin/app';

// Initialize Admin SDK once at the module level.
let adminApp: App | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;
let initializationError: string | null = null;

// This top-level try/catch block runs ONCE when the module is first loaded.
try {
  // createServerClient() now intelligently handles the preview environment.
  const result = createServerClient();
  if (result.app) {
    adminApp = result.app;
    adminDb = getAdminFirestore(adminApp);
  } else {
    // If createServerClient returns an error, we store it.
    initializationError = result.error;
  }
} catch (e: any) {
    // This is a fallback for any unexpected catastrophic failure during initialization.
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK in admin-actions.ts", e);
    initializationError = e.message || 'A critical server error occurred during initialization.';
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
    // If initializationError was set at the module level, this check fails.
    if (initializationError || !adminDb) {
      console.warn(`Admin action blocked: ${initializationError}`);

      const funcName = fn.name || '';
      // For functions that are expected to return an array (like fetching data),
      // return an empty array on failure to prevent UI crashes.
      if (funcName.toLowerCase().includes('get') && (funcName.toLowerCase().includes('requests') || funcName.toLowerCase().includes('profiles'))) {
         return [] as Awaited<ReturnType<T>>;
      }

      // For other functions (like mutations), return a standard error object.
      // Use the stored initializationError as the message.
      return { success: false, error: initializationError } as Awaited<ReturnType<T>>;
    }
    // If the check passes, execute the original function with the db instance.
    return fn(adminDb, ...args);
  };
}


// --- EXPORTED ADMIN ACTIONS ---
// Each action is now safely wrapped with the `withAdmin` guard.

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
      timestamp: new Date()
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
        enrollmentNumber: profileData.enrollmentNumber,
        location: profileData.location ?? { city: "Unknown", state: "Unknown" },
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


export const rejectRequest = withAdmin(async (
  db,
  requestId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> => {
  if (!requestId) {
    return { success: false, error: 'Request ID is required.' };
  }
  
  const finalReason = reason.trim() || 'Your profile verification has been rejected due to incomplete or invalid information.';

  try {
    const requestRef = db.collection('verificationRequests').doc(requestId);
    await requestRef.update({
      status: 'rejected',
      updatedAt: FieldValue.serverTimestamp(),
      lawyerNotification: finalReason,
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    return { success: false, error: error.message || 'Failed to reject request.' };
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
  const profiles: Record<string, string> = {};
  if (!userIds || userIds.length === 0) {
    return profiles;
  }
  try {
    const usersRef = db.collection('users');
    // Firestore 'in' queries are limited to 30 elements. 
    // We don't expect more here, but in a real-world scenario, this would need chunking.
    const q = usersRef.where('__name__', 'in', userIds);
    const snapshot = await q.get();
    
    if (snapshot.empty) {
      return profiles;
    }

    snapshot.docs.forEach(doc => {
      profiles[doc.id] = doc.data()?.username || 'Unknown User';
    });
    return profiles;
  } catch (err) {
    console.error('Error fetching user profiles:', err);
    // Return an empty object on error to ensure a consistent return type.
    return profiles;
  }
});

// This is an alias for withAdmin, kept for semantic clarity if needed, but they do the same thing.
const withAdminSafe = withAdmin;
