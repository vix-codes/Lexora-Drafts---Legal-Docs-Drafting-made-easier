import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

export function createServerClient(): App {
  if (getApps().some(app => app.name === 'admin-sdk')) {
    return getApps().find(app => app.name === 'admin-sdk')!;
  }

  if (!serviceAccount) {
    throw new Error(
      'Missing FIREBASE_SERVICE_ACCOUNT_KEY environment variable.'
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
  }, 'admin-sdk');
}
