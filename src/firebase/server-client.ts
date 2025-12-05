
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

export function createServerClient(): App | null {
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing admin credentials", {
      projectId,
      clientEmail,
      privateKeyExists: !!privateKey,
    });
    return null;
  }

  // Fix newline issue
  privateKey = privateKey.replace(/\\n/g, "\n");

  if (getApps().some(app => app.name === 'admin-sdk')) {
    return getApps().find(app => app.name === 'admin-sdk')!;
  }

  return initializeApp(
    {
      // @ts-ignore – admin cert fields are valid
      credential: cert({
        project_id: projectId,
        client_email: clientEmail,
        private_key: privateKey,
      }),
    },
    "admin-sdk"
  );
}
