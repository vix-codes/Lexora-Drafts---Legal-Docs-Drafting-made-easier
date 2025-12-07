
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

export function createServerClient(): App | null {
  // Prevent admin SDK in Firebase Studio preview or Edge runtime where env vars are not available
  if (process.env.NEXT_RUNTIME === "edge") {
    console.warn("Firebase Admin SDK is not available in this environment. Skipping initialization.");
    return null;
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing admin credentials. Admin SDK will not be initialized.");
    return null;
  }

  // When storing multiline strings in environment variables, newline characters
  // are often escaped. This line replaces the escaped `\\n` with actual newline
  // characters `\n` to ensure the private key is parsed correctly.
  privateKey = privateKey.replace(/\\n/g, '\n');

  // Ensure we don't initialize the app more than once
  const existingApp = getApps().find(app => app.name === 'admin-sdk');
  if (existingApp) {
    return existingApp;
  }

  try {
    return initializeApp(
      {
        credential: cert({
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey,
        }),
      },
      "admin-sdk"
    );
  } catch (error: any) {
      console.error("Failed to initialize Firebase Admin SDK:", error.message);
      return null;
  }
}
