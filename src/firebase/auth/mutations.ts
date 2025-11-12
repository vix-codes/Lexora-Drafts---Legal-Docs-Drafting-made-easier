'use client';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export async function signUpWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { auth, firestore } = initializeFirebase();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Add user profile to Firestore
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      email: user.email,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: 'This email is already in use. Please log in instead.' };
    }
    return { success: false, error: error.message };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const { auth, firestore } = initializeFirebase();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user profile exists
    const userRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
        // This case is unlikely if signup is the only way to create users, but good practice.
        await setDoc(userRef, {
            email: user.email,
            createdAt: serverTimestamp(),
        });
    }

    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { success: false, error: 'Invalid email or password. Please try again or sign up.' };
    }
    return { success: false, error: error.message };
  }
}
