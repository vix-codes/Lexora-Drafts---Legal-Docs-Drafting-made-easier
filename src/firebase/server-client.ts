import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore as getAdminFirestoreOriginal } from 'firebase-admin/firestore';

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
  if (isPreviewMode()) {
    return { app: null, error: PREVIEW_ERROR_MSG };
  }

  const existingApp = getApps().find(app => app.name === 'admin-sdk');
  if (existingApp) {
    return { app: existingApp, error: null };
  }
  
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

  try {
    privateKey = privateKey!.replace(/\\n/g, '\n');

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

export function getAdminFirestore() {
  const { app, error } = createServerClient();
  if (error || !app) {
    // This will make it clear in the server logs that the DB is not available.
    throw new Error(`Admin SDK not initialized: ${error}`);
  }
  return getAdminFirestoreOriginal(app);
}
