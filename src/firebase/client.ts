'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { firebaseConfig } from './config';

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export { app };
