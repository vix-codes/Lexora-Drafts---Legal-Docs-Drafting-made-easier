
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// Define a clearer return type for the function.
type ServerClientResult = {
  app: App | null;
  error: string | null;
};

const PREVIEW_ERROR_MSG = "Admin SDK is not available in the preview environment. This is expected and not a bug. Admin actions will be disabled.";

export function createServerClient(): ServerClientResult {
  // Firebase Studio/emulators set specific environment variables.
  // Check for these to determine if we are in a preview environment.
  const isStudioPreview = !!(process.env.FIREBASE_EMULATOR_HUB || process.env.FIREBASE_FIRESTORE_DT || process.env.FUNCTIONS_EMULATOR);

  if (isStudioPreview) {
    console.warn(PREVIEW_ERROR_MSG);
    return { app: null, error: PREVIEW_ERROR_MSG };
  }

  // Ensure we don't initialize the app more than once
  const existingApp = getApps().find(app => app.name === 'admin-sdk');
  if (existingApp) {
    return { app: existingApp, error: null };
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Check for missing variables and construct a specific error message.
    const missingVars: string[] = [];
    if (!projectId) missingVars.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
    
    if (missingVars.length > 0) {
        const errorMessage = `Failed to initialize Admin SDK: Missing environment variables [${missingVars.join(', ')}]. Please configure them in your deployment settings.`;
        console.error(errorMessage);
        return { app: null, error: errorMessage };
    }

    // When storing multiline strings in environment variables, newline characters
    // are often escaped. This line replaces the escaped `\\n` with actual newline
    // characters `\n` to ensure the private key is parsed correctly.
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
      // If initialization fails for any reason (e.g., invalid key), return the specific error.
      return { app: null, error: errorMessage };
  }
}

    
