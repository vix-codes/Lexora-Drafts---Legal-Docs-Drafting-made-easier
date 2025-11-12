import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

export function createServerClient(): App | null {
  if (!serviceAccount) {
    // Return null if the service account key is not available
    return null;
  }
  
  if (getApps().some(app => app.name === 'admin-sdk')) {
    return getApps().find(app => app.name === 'admin-sdk')!;
  }

  return initializeApp({
    credential: cert(serviceAccount),
  }, 'admin-sdk');
}
