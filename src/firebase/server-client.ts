
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const PREVIEW_ERROR_MSG = "Admin SDK is not available in the preview environment. Skipping initialization.";

export function createServerClient(): App | null {
  // Prevent admin SDK in Firebase Studio preview or Edge runtime where env vars are not available
  if (process.env.NEXT_RUNTIME === "edge") {
    console.warn(PREVIEW_ERROR_MSG);
    return null;
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    let missingVars = [];
    if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
    console.error(`Missing admin credential(s): ${missingVars.join(', ')}. ${PREVIEW_ERROR_MSG}`);
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

    