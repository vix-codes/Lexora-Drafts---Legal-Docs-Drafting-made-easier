import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!serviceAccount) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}
