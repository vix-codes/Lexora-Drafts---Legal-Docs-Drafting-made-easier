
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// Define a clearer return type for the function.
type ServerClientResult = {
  app: App | null;
  error: string | null;
};

const PREVIEW_ERROR_MSG = "Admin actions are not available in this preview environment. This is expected and not a bug.";

function isPreviewMode() {
  return Boolean(
    process.env.FIREBASE_EMULATOR_HUB ||      // Firestore emulator
    process.env.FIREBASE_FIRESTORE_DT ||     // Studio preview runtime
    process.env.FUNCTIONS_EMULATOR           // Functions emulator
  );
}

export function createServerClient(): ServerClientResult {
  // Case 1: Running in a preview/emulator environment
  if (isPreviewMode()) {
    console.warn(PREVIEW_ERROR_MSG);
    return { app: null, error: PREVIEW_ERROR_MSG };
  }

  // Ensure we don't initialize the app more than once
  const existingApp = getApps().find(app => app.name === 'admin-sdk');
  if (existingApp) {
    return { app: existingApp, error: null };
  }
  
  // Case 2: Missing credentials in a non-preview environment
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  const missingVars: string[] = [];
  if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
  if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
  if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');

  if (missingVars.length > 0) {
      const errorMessage = `Failed to initialize Admin SDK: Missing environment variables [${missingVars.join(', ')}]. Please configure them in your deployment settings.`;
      console.error(errorMessage);
      return { app: null, error: errorMessage };
  }


  // Case 3: Initialize Admin SDK normally (Vercel, etc.)
  try {
    privateKey = privateKey.replace(/\\n/g, '\n');

    const app = initializeApp(
      {
        credential: cert({
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey,
        }),
      },
      "admin-sdk"
    );

    return { app, error: null };
  } catch (error: any) {
      const errorMessage = `Failed to parse Admin SDK credentials. Ensure the private key is correctly formatted. Error: ${error.message}`;
      console.error(errorMessage);
      return { app: null, error: errorMessage };
  }
}
